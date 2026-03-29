---
title: 使用 MinGW ld 减小汇编程序在 Windows 上的可执行文件体积
date: 2026-03-26
description: 相信不少朋友都有过这样的经历：在 Windows 上使用 NASM 或其他汇编器编写程序，需要调用 C 函数，于是使用 MinGW GCC 进行链接。然而，即便只是一个简单的 `hello, world` 程序，生成的可执行文件却有几十 KB，反汇编一看更是充斥着陌生代码。这是为什么？本文将探讨是什么让你的程序变得如此“臃肿”，这些代码有何用途，以及如何绕开它们。
tags: [x86-64, 汇编, Windows]
---

# 使用 MinGW ld 减小汇编程序在 Windows 上的可执行文件体积

相信不少朋友都有过这样的经历：在 Windows 上使用 NASM 或其他汇编器编写程序，需要调用 C 函数，于是使用 MinGW GCC 进行链接。然而，即便只是一个简单的 `hello, world` 程序，生成的可执行文件却有几十 KB，反汇编一看更是充斥着陌生代码。这是为什么？本文将探讨是什么让你的程序变得如此“臃肿”，这些代码有何用途，以及如何绕开它们。

## 1. 标准库的链接

C 程序从源码变为可执行文件，需经历三个阶段：**编译**（C 代码 → 汇编代码）、**汇编**（汇编代码 → 二进制目标文件）、**链接**（将多个目标文件合并为最终可执行文件）。

如果程序使用了第三方库，就必须在链接阶段指定它们，否则会报 `undefined reference` 错误。标准库也不例外——只是使用 `gcc` 时，它会自动链接标准库，无需手动指定。

C 标准库通常由操作系统提供：Linux 上一般是 `libc.so`，Windows 上一般是 `msvcrt.dll`（Microsoft Visual C++ 运行时）。（这部分有些过于简略了，但对本文来说，知道这些就足够了）

## 2. `main` 并不是真正的入口点

C 语言中 `main` 函数的原型如下：

```c
int main(int argc, char** argv);
```

你有没有想过：`main` 是由谁调用的？`argc` 和 `argv` 又是谁传进来的？是操作系统吗？

如果你了解过 Win32 编程，就会知道 Win32 应用程序的主函数是 `WinMain` 或 `wWinMain`，其原型与普通的 `main` 完全不同。操作系统更不可能逐个适配各种编程语言的“主函数”——可执行文件对操作系统来说都是二进制机器码，无法区分。实际上，**`main` 并不是可执行文件真正的入口点**。对于 C 程序而言，真正的入口点是 **C 运行时（CRT）启动代码**。它通常会执行以下操作：

- 初始化内存空间
- 初始化标准库
- 通过操作系统 API 获取命令行参数，并解析为 `argc` 和 `argv`

完成所有准备工作后，CRT 启动代码才会调用 `main`。如果你熟悉 C++，全局变量的构造函数也是由 CRT 启动代码调用的。相应地，CRT 还有**结束代码**，在 `main` 返回后负责：调用 `atexit` 注册的退出函数、执行清理工作、将 `main` 的返回值传递给操作系统。CRT 启动与结束代码对 C 程序是必要的。然而，我们使用汇编编程，为的就是尽可能贴近底层。对我们来说，它们不但没有用处，反而是使可执行文件变大的“元凶”。

## 3. 使用 MinGW ld 直接链接

解决方案是使用 `ld`。与 `gcc` 不同，`ld` 只会链接显式传入的参数，不会自动链接任何库（包括 C 标准库和 CRT 代码）。

下面介绍几个我们需要用到的 `ld` 参数：

- `-e <符号>` — 指定可执行文件的**真正入口点**
- `-subsystem <类型>` — 指定子系统，可选值为 `console`（控制台）或 `windows`（GUI）。还有其他选项，但不常用。

知道这些后，我们就可以利用 `ld` 链接汇编程序，绕过 CRT 了。

### 示例：调用 `printf` 打印 `Hello from NASM!`

```asm
; file: main.asm
bits 64
default rel

extern printf

section .data
    msg db "Hello from NASM!", 10, 0

section .text
global start

start:
    sub rsp, 40              ; Windows x64 shadow space + 栈对齐
    lea rcx, [msg]           ; printf 第一个参数
    call printf
    add rsp, 40
    xor eax, eax
    ret
```

汇编命令：

```bash
nasm -f win64 main.asm -o main.obj
```

接下来，我们需要链接它。程序的入口点是 `start`，所以使用我们刚刚所讲的 `ld` 参数 `-e start`。这是一个控制台程序，所以使用 `-subsystem console`。还需要链接到 C 标准库，在这里，我们直接在参数中添加 `C:/Windows/System32/msvcrt.dll` 即可。完整的链接命令是这样的：

```bash
ld main.obj C:/Windows/System32/msvcrt.dll -e start -subsystem console
```

### 使用 Makefile 自动化构建

```makefile
RM = del /f /q

# 在这里设置输出的可执行文件的名称
BIN = a.exe
# 在这里设置可执行文件的入口点
ENTRY = start

.PHONY: all clean rebuild

all: $(BIN)

$(BIN): main.obj
	ld main.obj -o $(BIN) \
	C:/Windows/System32/msvcrt.dll \
	-e $(ENTRY) \
	-subsystem console

main.obj: main.asm
	nasm -f win64 main.asm -o main.obj

clean:
	$(RM) $(BIN) main.obj

rebuild: clean all
```

构建完成后，你会发现生成的可执行文件比使用 `gcc` 时小得多

## 4. 进一步分析

反汇编生成的可执行文件，仍会发现一些“来历不明”的符号：

```
PS E:\projects\nasm\hw> objdump -dMintel a.exe

a.exe:     file format pei-x86-64


Disassembly of section .text:

0000000140001000 <___crt_xc_end__>:
   140001000:   48 83 ec 28             sub    rsp,0x28
   140001004:   48 8d 0d f5 0f 00 00    lea    rcx,[rip+0xff5]        # 140002000 <__data_start__>
   14000100b:   e8 08 00 00 00          call   140001018 <printf>
   140001010:   48 83 c4 28             add    rsp,0x28
   140001014:   31 c0                   xor    eax,eax
   140001016:   c3                      ret    
   140001017:   90                      nop

0000000140001018 <printf>:
   140001018:   ff 25 1a 20 00 00       jmp    QWORD PTR [rip+0x201a]        # 140003038 <__IAT_start__>
   14000101e:   90                      nop
   14000101f:   90                      nop

0000000140001020 <__CTOR_LIST__>:
   140001020:   ff                      (bad)
   140001021:   ff                      (bad)
   140001022:   ff                      (bad)
   140001023:   ff                      (bad)
   140001024:   ff                      (bad)  
   140001025:   ff                      (bad)
   140001026:   ff                      (bad)
   140001027:   ff 00                   inc    DWORD PTR [rax]
   140001029:   00 00                   add    BYTE PTR [rax],al
   14000102b:   00 00                   add    BYTE PTR [rax],al
   14000102d:   00 00                   add    BYTE PTR [rax],al
        ...

0000000140001030 <__DTOR_LIST__>:
   140001030:   ff                      (bad)
   140001031:   ff                      (bad)
   140001032:   ff                      (bad)
   140001033:   ff                      (bad)  
   140001034:   ff                      (bad)
   140001035:   ff                      (bad)
   140001036:   ff                      (bad)
   140001037:   ff 00                   inc    DWORD PTR [rax]
   140001039:   00 00                   add    BYTE PTR [rax],al
   14000103b:   00 00                   add    BYTE PTR [rax],al
   14000103d:   00 00                   add    BYTE PTR [rax],al
        ...
```

其中的 `___crt_xc_end__`，不难看出来，就是我们所写的代码。

`__CTOR_LIST__` 和 `__DTOR_LIST__` 是为了对应 ELF 格式中的 `.init_array` 和 `.fini_array`，用于支持 C++ 全局构造函数和析构函数。即使我们未使用 C++ 和 CRT，为了保证**任何**由 GNU 工具链编译的目标文件都能安全链接，`ld` 会无条件生成它们。如果想要去除它们，我们可以使用自定义链接脚本。

### 使用自定义链接脚本去除多余符号

找到 `ld` 的 PE32+ 默认链接脚本 `i386pep.x`，通常位于：

```
<MinGW 安装目录>\mingw64\x86_64-w64-mingw32\lib\ldscripts\i386pep.x
```

将其复制到源码目录，重命名为 `link.ld`，然后删除以下内容：

```ld
       ___CTOR_LIST__ = .;
       __CTOR_LIST__ = .;
       LONG (-1); LONG (-1);
       KEEP (*(.ctors));
       KEEP (*(.ctor));
       KEEP (*(SORT_BY_NAME(.ctors.*)));
       LONG (0); LONG (0);
       ___DTOR_LIST__ = .;
       __DTOR_LIST__ = .;
       LONG (-1); LONG (-1);
       KEEP (*(.dtors));
       KEEP (*(.dtor));
       KEEP (*(SORT_BY_NAME(.dtors.*)));
       LONG (0); LONG (0);
```

然后，我们需要使用 `ld` 的 `-T` 参数来指定自定义链接脚本。修改 Makefile：

```makefile
$(BIN): main.obj
	ld main.obj -o $(BIN) \
	C:/Windows/System32/msvcrt.dll \
	-e $(ENTRY) \
	-subsystem console \
	-T link.ld
```

重新构建并反汇编，`__CTOR_LIST__` 和 `__DTOR_LIST__` 便消失了。

### 关于 `printf` 的跳转包装

反汇编中还会看到一个 `printf` 的 *wrapper*（跳转桩），其唯一作用是跳转到 DLL 中真正的 `printf`。由于 PE 文件支持重定位，DLL 的加载基址在链接时无法确定，因此必须通过导入表间接调用。除非你完全不使用链接器、手写导入表，否则这一层间接调用无法避免。

### 进一步缩小体积

在链接命令末尾添加 `-s` 参数，可去除符号信息，进一步压缩可执行文件体积——但这样反汇编输出会失去符号标注，可读性下降。

---

> **小结：** 使用 `ld` 代替 `gcc` 进行链接，可以绕过 CRT 启动/结束代码，显著减小汇编程序生成的可执行文件体积。配合自定义链接脚本和 `-s` 参数，可以进一步精简输出文件。
