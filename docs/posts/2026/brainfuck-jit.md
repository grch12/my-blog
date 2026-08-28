---
title: 手写一个适用于 x86-64 Linux 的 Brainfuck JIT 编译器
date: 2026-08-15
description: 为 Brainfuck 这样简单的“编程语言”写一个 JIT 编译器并不难，而且很有趣
tags: [x86-64, 汇编, C, Linux]
---

# 手写一个适用于 x86-64 Linux 的 Brainfuck JIT 编译器

[Brainfuck](https://esolangs.org/wiki/Brainfuck) 是一门“深奥编程语言（Esoteric Programming Language）”，语言包含一个假想的分成若干单元的纸带和一个指向纸带中的单元的指针，并在纸带上进行各种操作，有点类似图灵机的概念。

Brainfuck 的设计非常极简主义，仅有 8 种命令：

| 命令 | 功能 |
| --- | --- |
| + | 将指针所指单元的值 +1 |
| \- | 将指针所指单元的值 -1 |
| < | 将指针向左移动一个单元 |
| > | 将指针向右移动一个单元 |
| \[ | 如果指针所指单元的值为 0，则跳转到匹配的 \] 命令 |
| \] | 如果指针所指单元的值不为 0，则跳转到匹配的 \[ 命令 |
| . | 输出指针所指单元的值 |
| , | 从标准输入读取一个字符，并将其写入指针所指的单元 |

用 Brainfuck 写的 hello, world 是这个样子的：

```
++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.
```

为 Brainfuck 这样简单的“编程语言”写一个 JIT 编译器并不会比写解释器难多少，而且很有趣。

## JIT 编译器的基本原理

JIT（Just In Time）编译器的基本原理是，向内存中写入机器码并直接执行，无需生成可执行文件。

想一想该怎么实现呢？先分配内存，获得指针，向其中写入机器码，然后将指针转换成函数指针，然后调用就可以了，是这样吗？

```c
void* mem = malloc(1024);
// 写入机器码……

void (*f)(void) = mem;
f();
```

如果你真的尝试运行上面的代码，将会看到出错信息：`Segmentation fault`。这是因为，现代计算机和操作系统都具有“内存保护”机制，简单来讲，内存也可以像文件一样，设置读（R）、写（W）、执行（X）等权限。使用 `malloc()` 分配的内存只具有读和写权限，无法执行。要使指定的内存区域可执行，需要使用更底层的操作系统 API。

在 Linux 上，`mmap()` 可以分配内存区域，并允许指定其权限。`mmap()` 的原型位于 `sys/mman.h` 中：

```c
void* mmap(void* addr, size_t length, int prot, int flags, int fd, off_t offset);
```

其中的 `prot` 参数指定了内存区域的权限，可以是下面这些值之一：

| 值 | 说明 |
| --- | --- |
| PROT_READ | 读 |
| PROT_WRITE | 写 |
| PROT_EXEC | 执行 |
| PROT_NONE | 无任何权限，不可访问 |

也可以使用按位或的方式组合多个权限，例如 `PROT_READ | PROT_WRITE`。

正如 `malloc()` 之后要调用 `free()` 释放一样，`mmap()` 之后也要记得调用 `munmap()` 释放内存区域。下面是 `munmap()` 的原型：

```c
int munmap(void* addr, size_t length);
```

下面这个例子使用 `mmap()` 分配了一块可读、可写、可执行的内存区域：

```c
// mmap() 分配内存的大小以页为单位，一页一般为 4KB
void* mem = mmap(NULL, 4096, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

// 进行操作……

munmap(mem, 4096);
```

另外，为了防止代码被覆盖，引起安全风险，一些操作系统不允许内存区域同时可写和可执行。解决办法是先分配可读写的内存，写入机器码，然后使用 `mprotect()` 将其设置为可读可执行，撤销写权限。`mprotect()` 的原型如下：

```c
int mprotect(void* addr, size_t len, int prot);
```

下面是一个完整的例子：

```c
void* mem = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);

// 写入机器码……

mprotect(mem, 4096, PROT_READ | PROT_EXEC);

void (*f)(void) = mem;
f();

munmap(mem, 4096);
```

## 整体设计

我们将定义一个 `emit_code()` 函数，它将接收 Brainfuck 源代码字符串作为参数。该函数将遍历字符串中的每一个字符，并调用对应的 `emit_code_xxx()` 函数来生成机器码。例如，遇到 `+` 字符，就调用 `emit_code_add()` 函数，遇到 `-` 字符，就调用 `emit_code_sub()` 函数，以此类推。我们还需要一个程序计数器（Program Counter）来记录当前已经生成了多少机器码。

`emit_code()` 函数的实现将会类似这样：

```c
void emit_code(void* buf, const char* source) {
  size_t pc = 0;
  for (size_t i = 0; source[i] != '\0'; i++) {
    switch (source[i]) {
      case '+':
        emit_code_add(buf, &pc);
        break;
      case '-':
        emit_code_sub(buf, &pc);
        break;
      // ...
      default:
        break;
    }
  }
}
```

而 `emit_code_add()` 函数的实现将会类似这样：

```c
void emit_code_add(void* buf, size_t* pc) {
  char* mem = (char*)buf + *pc;
  *mem = ...; // 生成机器码
  *pc += ...; // 增加程序计数器的值
}
```

## 生成机器码

现在我们已经设计好了程序的整体架构，该实现生成机器码的函数了。最直接的方法当然是手动写入，可以看下面的例子：

```c
#include <stdio.h>
#include <sys/mman.h>

int main(void) {
  char* mem = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
  if (mem == MAP_FAILED) {
    perror("内存分配失败");
    return 1;
  }

  // 在 x86 中，C3 是 ret 的操作码
  mem[0] = 0xc3;

  mprotect(mem, 4096, PROT_READ | PROT_EXEC);

  void (*f)(void) = mem;
  f();

  puts("成功了！");

  munmap(mem, 4096);
  return 0;
}
```

但是，如果每个命令都要这样手动写入机器码，那也太麻烦了，而且完全没有可读性。这里我们使用一种比较取巧的方法：使用汇编语言编写一些“模板代码”，让汇编器帮我们翻译成机器码，然后复制到目标内存中。例如，`+` 命令的模板代码可以是这样的：

```asm
# 使用 AT&T 语法

.data # 注意这里是 .data 而不是 .text
.global code_add_start
.global code_add_end
code_add_start:
  # 假设 %r12 是纸带指针
  incb (%r12)
code_add_end:
```

而 C 语言那边，可以这样实现 `emit_code_add()` 函数：

```c
extern char code_add_start[];
extern char code_add_end[];
void emit_code_add(void* buf, size_t* pc) {
  size_t sz = code_add_end - code_add_start;
  char* mem = (char*)buf + *pc;
  memcpy(mem, code_add_start, sz);
  *pc += sz;
}
```

## 括号匹配

对于括号，我们使用经典的方法：用一个栈记录括号的位置。在遇到 `[` 时，将当前 PC 值压入栈中，遇到 `]` 时弹出栈顶的 PC 值，然后将当前 PC 值和弹出的 PC 值相减，得到跳转偏移量，再将偏移量写入目标内存中。下面是具体的实现：

:::code-group

```asm [code.s]
.data
.global code_lbracket_start
.global code_lbracket_end
code_lbracket_start:
  # 当前单元是否为 0
  cmpb $0, (%r12)
  # 为 0 时跳转，0x12345678 是占位符，我们将在后面填入跳转偏移量
  je 0x12345678
code_lbracket_end:

.global code_rbracket_start
.global code_rbracket_end
code_rbracket_start:
  cmpb $0, (%r12)
  # 不为 0 时跳转
  jne 0x12345678
code_rbracket_end:
```

```c [main.c]
extern char code_lbracket_start[];
extern char code_lbracket_end[];
void emit_code_lbracket(void* buf, size_t* pc, size_t* stack, size_t brackets) {
  size_t sz = code_lbracket_end - code_lbracket_start;
  char* mem = (char*)buf + *pc;
  memcpy(mem, code_lbracket_start, sz);
  *pc += sz;
  // 将当前 PC 值压入栈
  stack[(*brackets)++] = *pc;
}

extern char code_rbracket_start[];
extern char code_rbracket_end[];
void emit_code_rbracket(void* buf, size_t* pc, size_t* stack, size_t brackets) {
  size_t sz = code_rbracket_end - code_rbracket_start;
  char* mem = (char*)buf + *pc;
  memcpy(mem, code_rbracket_start, sz);
  *pc += sz;
  // 弹出栈顶，获得匹配的左括号的 PC 值
  size_t matching_bracket = stack[--*brackets];
  // 根据 x86-64 的指令编码规则，立即数总是位于末尾，所以只要将当前 PC 值 -4 即为跳转偏移量所在的内存位置
  int32_t* displacement_r = (int32_t*)(buf + *pc - 4);
  // 写入跳转偏移量
  *displacement_r = (int32_t)(matching_bracket - *pc);
  // 处理左括号的跳转偏移量
  int32_t* displacement_l = (int32_t*)(buf + matching_bracket - 4);
  *displacement_l = (int32_t)(*pc - matching_bracket);
}
```

:::

## 输入输出

输入输出直接使用 Linux 系统调用即可：

```asm
.global code_output_start
.global code_output_end
code_output_start:
  movq $1, %rax # 系统调用号，sys_write
  movq $1, %rdi # 标准输出文件描述符
  movq %r12, %rsi # 纸带指针
  movq $1, %rdx # 数量
  syscall
code_output_end:

.global code_input_start
.global code_input_end
code_input_start:
  movq $0, %rax # 系统调用号，sys_read
  movq $0, %rdi # 标准输入文件描述符
  movq %r12, %rsi # 纸带指针
  movq $1, %rdx # 数量
  syscall
code_input_end:
```

## 更多

本文介绍了 JIT 编译器的基本原理，并说明了如何实现一个简单的 Brainfuck JIT 编译器。我已经写了一个更完善的 Brainfuck JIT 编译器，它具有边界检查等更多功能，并且在生成代码时会进行优化，性能更高。感兴趣的读者可以阅读其源码：[grch12/brainfuck-jit](https://github.com/grch12/brainfuck-jit)。

我还计划将它移植到更多平台上。我目前已经成功移植到 Haiku OS 上，它与 Linux 同为类 Unix 操作系统、同样遵守 POSIX 标准、同样使用 System V ABI，所以这没有什么难度（这个移植版我目前不打算发布）。未来还会移植到 Windows 上，不过这毫无疑问复杂得多。首先，Windows 不使用 System V ABI，而是使用自己的 [Microsoft x64 ABI](../2025/x86-64-abi.html)，所以寄存器要重新分配；其次，类 Unix 操作系统大多提供了方便的系统调用机制，供程序直接使用，而 Windows 则要求应用程序调用 Windows API 函数，由 Windows API 执行系统调用，这就意味着我们必须手动处理重定位等问题。我还计划移植到 ARM、RISC-V 等不同架构上，不过那大概是很久以后的事情了。
