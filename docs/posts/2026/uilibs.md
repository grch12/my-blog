---
title: 盘点我用过或听说过的 C/C++ UI 库
date: 2026-02-07
description: 本文盘点了我用过或听说过的 C/C++ UI 库，列举了它们的优点和缺点。
tags: [C, C++, GUI]
---

# 盘点我用过或听说过的 C/C++ UI 库

## 用过的

### [IUP](https://www.tecgraf.puc-rio.br/iup/)
优点：
 - C 语言
 - 非常好的教程
 - 简单
 - 宽松许可证（MIT）

缺点：
 - 有一些 bug
 - 原生控件，没有什么自定义可言

### [FLTK](https://www.fltk.org/)
优点：
 - 较为轻量
 - LGPL with exception （允许静态链接）
 - 功能较为齐全

缺点：
 - 自定义控件（甚至不使用 GTK）
 - 丑

### [U++](https://www.ultimatepp.org/)
优点：
 - 功能较为齐全
 - 宽松许可证（BSD）
 - 原生控件，但允许自定义，支持暗色模式
 - IDE 其实还行，有图形化的界面设计器（类似 VS）

缺点：
 - 捆绑 IDE
 - 必须使用他们的构建工具 umake
 - 不使用 STL（也许这其实可以算优点？）

### [gtkmm](https://gtkmm.gnome.org/en/index.html)
优点：
 - 功能齐全
 - 挺好看的
 - 成熟

缺点：
 - Windows 并不是它的首要支持目标
 - autotools
 - 大量外部依赖
 - LGPL（不允许静态链接）
 - 复杂

### [Dear ImGui](https://github.com/ocornut/imgui)
优点：
 - 挺好看的
 - 宽松许可证（MIT）

缺点：
 - 依赖 OpenGL/DX
 - 立即模式，开销较大，不适合一般程序

### [raygui](https://github.com/raysan5/raygui)
优点：
 - C 语言
 - 使用起来较为简单
 - 宽松许可证（zlib）

缺点：
 - 依赖 OpenGL
 - 立即模式，开销较大，不适合一般程序
 - 如 raylib 本体一样，显示中文很麻烦

## 听说过的

### [wxWidgets](https://wxwidgets.org/)
优点：
 - 成熟

缺点：
 - 大量使用宏
 - 原生控件，没有什么自定义可言
 - 复杂

### [Qt](https://www.qt.io/)
优点：
 - 成熟
 - 功能齐全
 - 高度可自定义

缺点：
 - 复杂
 - 开销较大
 - 许可证是大坑（并非完全 LGPL！）

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
 - C语言
