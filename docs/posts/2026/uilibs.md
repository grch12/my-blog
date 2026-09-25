---
title: 盘点我用过或听说过的 C/C++ UI 库
date: 2026-02-07
description: 本文盘点了我用过或听说过的 C/C++ UI 库，列举了它们的优点和缺点。
tags: [C, C++, GUI]
---

# 盘点我用过或听说过的 C/C++ UI 库

## 用过的

### [IUP](https://www.tecgraf.puc-rio.br/iup/)

IUP 是巴西里约热内卢天主教大学团队开发的轻量 GUI 库（顺带一提，Lua 也是他们学校的人开发的）。我是在翻 cppreference 的时候无意间发现的这个库。

优点：

- 纯 C 语言
- 非常好的教程
- 简单
- 宽松许可证（MIT）

缺点：

- 有一些 bug
- 原生控件，没有什么自定义可言

支持平台：

- Windows（Win32）
- 类 Unix（可选 GTK/Motif 后端）

### [FLTK](https://www.fltk.org/)

FLTK 是一款跨平台、轻量的 C++ GUI 库。

优点：

- 较为轻量
- LGPL with exception（允许静态链接）
- 功能较为齐全

缺点：

- 自定义控件（甚至不使用 GTK）
- 丑（新版本加了个主题，好些了）

支持平台：

- Windows
- macOS
- 类 Unix（可选 X11/Wayland 后端）

使用该库开发的知名项目：

- Dillo - 轻量级网络浏览器
- Gmsh - 3D 网格生成软件
- HTMLDOC - HTML 文档转换工具

### [U++](https://www.ultimatepp.org/)

U++ 是一款主打快速应用开发（RAD）的 C++ 框架，可以说是“C++ 版的 Delphi”。

优点：

- 功能较为齐全
- 宽松许可证（BSD）
- 原生控件，但允许自定义，支持暗色模式
- IDE 其实还行，有图形化的界面设计器（类似 VS）

缺点：

- 捆绑 IDE
- 必须使用他们的构建工具 umake
- 不使用 STL（也许这其实可以算优点？）

支持平台：

- Windows（Win32）
- macOS（Cocoa）
- Linux、FreeBSD（基于 GTK 封装）

使用该框架开发的知名项目：

- U++ IDE 自己

### [gtkmm](https://gtkmm.gnome.org/en/index.html)

gtkmm 是 GTK 的 C++ wrapper。GTK 本身是 GIMP、GNOME 等项目所使用的 GUI 库。使用 GTK 可以开发出非常美观的界面，但它写起来堪称反人类，而 gtkmm 就好多了。这里不再将 GTK 单独列出来。

优点：

- 功能齐全
- 挺好看的
- 成熟

缺点：

- Windows 并不是它的首要支持目标
- autotools，在 Windows 上需要 MSYS2
- 大量外部依赖
- LGPL（不允许静态链接）
- 复杂

支持平台：

- Windows
- 类 Unix

使用该库开发的知名项目：

- GParted - 磁盘管理工具
- Inkscape - 矢量图形编辑器

### [Dear ImGui](https://github.com/ocornut/imgui)

Dear ImGui 是主要用于游戏内 GUI 的库，也可以用于一般应用程序。

优点：

- 挺好看的
- 宽松许可证（MIT）

缺点：

- 依赖 OpenGL/DX
- 立即模式，开销较大，不适合一般程序

支持平台：任何支持 DirectX 或 OpenGL 的平台

### [raygui](https://github.com/raysan5/raygui)

raygui 是基于 raylib 的 GUI 库。

优点：

- 纯 C 语言
- 使用起来较为简单
- 宽松许可证（zlib）

缺点：

- 依赖 OpenGL
- 立即模式，开销较大，不适合一般程序
- 如 raylib 本体一样，显示中文很麻烦

支持平台：任何支持 OpenGL 的平台。以下是官方列出的：

- Windows
- macOS
- GNU/Linux
- FreeBSD
- 树莓派
- Android
- Web

### Win32 API

Win32 API 是 Windows 操作系统提供的编程接口。时至今日，依然有不少项目是直接使用 Win32 API 开发的。

优点：

- 纯 C 语言
- 真正零依赖
- 灵活，开发者可以进行底层控制

缺点：

- 仅支持 Windows，完全没有可移植性
- 复杂，创建个空白窗口都要几十行代码
- 繁琐，大量重复/模式化的代码，使用 Win32 API 的大型项目基本都会自己写一个包装层；既然如此，为什么不干脆用成熟的 GUI 库呢？

支持平台：Windows

直接使用 Win32 API 开发的知名项目：

- Windows 自己
- 数不胜数

## 听说过的

### [wxWidgets](https://wxwidgets.org/)

wxWidgets 是老牌的跨平台 GUI 库。因为它比较老，所以使用了许多现在被认为过时的范式。

优点：

- 成熟

缺点：

- 大量使用宏
- 原生控件，没有什么自定义可言
- 复杂
- LGPL（不允许静态链接）

支持平台：

- Windows（Win32）
- macOS（Cocoa）
- 类 Unix（可选 GTK/Qt/Motif/X11 后端）

使用该库开发的知名项目：

- Audacity - 音频编辑软件
- Poedit - 翻译工具
- FileZilla - FTP 客户端

### [Qt](https://www.qt.io/)

Qt 是知名的企业级跨平台 GUI 框架，大家肯定都熟悉，无需过多介绍。

优点：

- 成熟
- 功能齐全
- 高度可自定义

缺点：

- 复杂
- 性能开销和体积都较大
- 许可证是大坑（并非完全 LGPL！）

支持平台：

- Windows
- macOS
- Linux
- Android
- iOS

使用该框架开发的知名项目：

- KDE Plasma 桌面环境
- Krita - 图像编辑软件
- WPS Office - 办公套件
- 数不胜数

### [CopperSpice](https://copperspice.com/)

CopperSpice 是 Qt4 的 fork，削减了许多臃肿的部分，比 Qt 轻了不少，并且使用现代 C++（当前要求 C++20）。移除了一些非标准的东西，不需要 QMake 和 MOC。

优点：

- 现代 C++
- 源自 Qt，功能较为齐全
- 许可证比 Qt 更干净（LGPL 2.1）

缺点：

- 与 Qt 分家已经有一段时间，存在一些不兼容
- 仍然是 LGPL，不允许静态链接
- 有可能需要自行编译，非常耗时

支持平台：

- Windows
- macOS
- Linux

### [RmlUi](https://github.com/mikke89/RmlUi)

优点：

- 我没试过，不过看起来还不错
- HTML、CSS
- 宽松许可证（MIT）

缺点：

- 依赖 OpenGL
- 开销较大

### [LCUI](https://github.com/lc-soft/LCUI)

优点：

- 我没试过，不过看起来还不错
- HTML、CSS
- 宽松许可证（MIT）
- 纯 C 语言
