---
title: 使 32 位 Windows 程序可使用最大 4GB 内存
date: 2026-04-26
description: PE 文件头中有一个标志位，称为 LargeAddressAware。只有启用它后，应用程序才可使用超过 2GB 内存空间。本文将介绍如何为已编译的应用程序启用它，以及启用它都有什么好处和坏处。
tags: [x86, x86-64, Windows, C]
---

# 使 32 位 Windows 程序可使用最大 4GB 内存

## 1. 什么是 LAA

32 位 x86 处理器可以寻址最大 4GB 内存空间。然而，应用程序并不能完全使用这些空间。32 位 Windows 默认只允许应用程序最多使用 2GB 空间，剩下的空间被保留供操作系统和其他程序使用。

在 32 位 Windows 上，要想突破这一限制，不仅需要对操作系统进行特殊配置，还需要应用程序主动声明支持超过 2GB 的“大地址”。在 PE 文件头中有一个字段 `uint16_t mCharacteristics`，该字段中有一个标志位 `LargeAddressAware`（LAA），开发者通过将该位设为 1 来告知操作系统本程序可以正确处理大于 2GB 的地址。

在如今的 64 位 Windows 上，不再需要对操作系统进行特殊配置，但仍然只有设置了 `LargeAddressAware`（LAA）的程序可以使用超过 2GB 内存空间。

## 2. 启用 LAA 的好处与潜在的问题

启用了 LAA 的 32 位程序可以突破 2GB 内存限制。在 32 位 Windows 上，可以使用最大 3GB 内存。而在 64 位 Windows 上，它们将能够使用最大 4GB 内存（32 位地址上限）。如果你在运行某些 32 位老游戏或者比较吃资源的软件，遇到卡顿或者崩溃，启用 LAA 很有可能可以改善这些问题。

然而，LAA 不是万金油，32 位程序即使启用了 LAA 也无法和真正的 64 位程序相比。另外，有些程序可能会将指针当作有符号整数处理。在未启用 LAA 时，这没有任何问题，因为 2GB 正好是 32 位有符号整数的上限。而在启用 LAA 后，它们可能会错误地将超过 2GB 的地址当作负数，从而导致出错或崩溃。因此，在为 32 位程序启用 LAA 前，请务必备份原文件。

> [!NOTE]
> 上述讨论只针对 32 位程序，对于 64 位程序来说，LAA 是默认开启的，并且它们可以寻址上百 TB 空间，因此无需考虑这些限制。

## 3. 如何启用 LAA

使用 MSVC 编译器附带的 `editbin` 工具就可以非常方便地给已经编译的应用程序启用 LAA：

```cmd
editbin /LargeAddressAware C:\path\to\your\app.exe
```

然而，大部分人的电脑上都没有安装 MSVC 编译器。为了启用 LAA 去安装它也实在有点小题大做。我们可以写一个简单的程序来启用 LAA。

> [!TIP]
> 下面的示例是用 C 语言写的，但你也完全可以用别的编程语言（如 Python）来实现，基本思路是一致的。如果你不关心这些技术细节，可以直接翻到文章末尾，那里有可以直接用的程序的链接。

我们首先需要从 PE 文件中获取 PE 文件头的偏移量（此处仅展示核心逻辑，魔数校验等已略去）：

```c
uint32_t GetPEHeaderOffset(const char* image) {
  // 0x3c（十进制为 60）是 e_lfanew 在 DOS 头中的偏移量，读取它即可获得 PE 头的偏移量
  return *(uint32_t*)(image + 0x3c);
}
```

知道了偏移量后，就可以读取 PE 头了。PE 头的结构如下：

```c
struct PeHeader {
	uint32_t mMagic; // "PE\0\0" or 0x00004550
	uint16_t mMachine;
	uint16_t mNumberOfSections;
	uint32_t mTimeDateStamp;
	uint32_t mPointerToSymbolTable;
	uint32_t mNumberOfSymbols;
	uint16_t mSizeOfOptionalHeader;
	uint16_t mCharacteristics;
};
```

`mCharacteristics` 字段是 PE 文件的特征信息，其中就包含了 LAA 标志位。可以这样获得它：

```c
uint16_t* GetCharacteristics(const char* image, uint32_t offset) {
   // 0x16（十进制为 22）是 mCharacteristics 的偏移量
  return (uint16_t*)(image + offset + 0x16);
}
```

LAA 是 `mCharacteristics` 的第 6 位，通过一些简单的按位运算，我们就能知道一个程序是否启用了 LAA：

```c
int main(void) {
  // 打开并读取文件
  FILE* fp = fopen("path/to/your/app.exe", "rb");
  size_t size = FileSize(fp);
  char* buf = malloc(size);
  fread(buf, size, 1, fp);
  fclose(fp);

  // 获取 PE 头偏移量
  uint32_t offset = GetPEHeaderOffset(buf);

  // 获取特征信息
  uint16_t* characteristics = GetCharacteristics(buf, offset);

  // 0x20 == 0010 0000
  if (*characteristics & 0x20) {
    puts("程序启用了 LAA");
  } else {
    puts("程序未启用 LAA");
  }

  free(buf);
  return 0;
}
```

要为程序启用 LAA，只需使用按位或运算即可：

```c
  *characteristics |= 0x20;
  FILE* newFp = fopen("path/to/your/app.exe", "wb");
  fwrite(buf, size, 1, newFp);
  fclose(newFp);
  puts("成功启用了 LAA");
```

## 4. 一个启用 LAA 的工具

我已经制作了一个为已编译的程序启用 LAA 的工具，它会检测文件是否为有效的 PE 文件、是否为 x86 架构、是否尚未启用 LAA。满足以上条件后，它才会进行修改。在修改前，它会备份原文件。只需运行它，然后输入要启用 LAA 的程序的路径即可。如果你将文件拖到终端窗口上，路径可能会被引号包围，请删除引号。

完整源码在这个 GitHub 仓库中：[grch12/large-address-aware-patcher](https://github.com/grch12/large-address-aware-patcher)。Release 中提供了编译好的程序，是针对 x64 Windows 的，并且依赖 UCRT。

由于这个程序只使用 C 标准库，所以你完全可以在其他操作系统乃至不同架构的机器上编译它，唯一的要求是目标架构的字节序必须为小端序（与 x86 相同）。

### 2026年5月9日更新

上面的预编译可执行文件由于使用了 UTF-8 代码页，所以需要 Windows 10 1803+ 才能正常运行。如果你使用的是老版本 Windows，可以在自行编译时去除下面的宏定义：

```c
#define USE_UTF8
```

这会让程序使用 ANSI 代码页，从而可以在旧版 Windows 上运行。

另外，我还做了一个 GUI 版本：[grch12/laa-patcher-gui](https://github.com/grch12/laa-patcher-gui)。这个版本使用 Win32 API，因此是 Windows exclusive。不过它使用 UTF-16 编码，依赖 MSVCRT，因此对旧版 Windows 兼容性更好。

## 参考

[Windows 和 Windows Server 版本的内存限制 - Win32 apps | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/win32/memory/memory-limits-for-windows-releases)

[PE - OSDev Wiki](https://wiki.osdev.org/PE)

[IMAGE_FILE_HEADER （winnt.h） - Win32 apps | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/win32/api/winnt/ns-winnt-image_file_header)
