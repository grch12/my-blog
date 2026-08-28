---
title: 折腾 Alpine Linux 的记录
date: 2026-08-28
description: 经过长时间的折腾和多次踩坑，终于把 Alpine Linux 变成了可以日常使用的桌面操作系统
tags: [Linux]
---

# 折腾 Alpine Linux 的记录

Alpine Linux 是一个非常轻量的 Linux 发行版，它与主流发行版的主要区别是它使用 BusyBox、OpenRC 和 musl libc，而非主流发行版的 GNU coreutils、systemd 和 glibc。

最近我在家里的一台“远古”电脑上安装了 Alpine。这台电脑大约制造于 2008 年，使用 Core 2 Duo T5450 CPU，内存仅有 1GB，BIOS 引导。值得一提的是，它已经配备了无线网卡和蓝牙——这在那个时候可是新鲜玩意儿。

为什么选择 Alpine Linux，而非其他 Linux 发行版？

- Xubuntu、Lubuntu 等虽然相对轻量，但对于这台电脑来说依然过重
- Bodhi Linux 确实很轻量，但上次更新已经是在 3 年前，目前半死不活，而 Alpine 依然活跃
- 包括上述发行版以及 Arch、Debian、openSUSE 在内的大多数发行版都使用 systemd，而 Alpine 使用更轻量的 OpenRC，开机速度快得多
- Gentoo 虽然可以使用 OpenRC，但配置过于复杂，还要自行编译，对这台仅有 Core 2 CPU 的电脑并不友好
- antiX 不用 systemd，但也不支持桌面环境，仅使用轻量级的窗口管理器，外观不佳，且过于小众，严重缺乏文档
- 比 Alpine 更轻量的发行版大多缺这缺那，基本不能日常使用

综上所述，Alpine 是一款较为平衡的选择，既避免了臃肿，又不像部分发行版那样精简过头。而且 Alpine 的维护非常积极，软件包的更新也很及时，这也是我选择它的原因之一。

另外需要说明的是，Alpine 作为一款轻量发行版，许多配置都需要使用命令行或者手动改配置文件，不适合追求新手友好、开箱即用的人。这篇文章面向的是像我一样爱折腾的人，图省事的话可以试试 Linux Mint Xfce 版，但硬件要求毫无疑问高得多。

本文中的信息截止到 Alpine Linux v3.24。

> 警告：本文是作者根据事后回忆写成，可能存在错误或不准确。如果你发现了错误，欢迎指正，但作者对参照本文进行操作而造成的任何后果概不负责。

## 1. 准备

这台电脑已经装有 Windows 7，我不会删除它，而是安装双系统。因为手头没有空闲的 U 盘，这次我打算尝试在不使用 U 盘的情况下安装。思路很简单：建立一个分区，将 Live ISO 文件的内容复制到其中，然后从这个分区引导即可。

前往 [Alpine 官方网站](https://alpinelinux.org/)，下载最新的 Alpine Linux ISO 镜像，大小约为 350MB。下载好后记得校验哈希值。

## 2. 分区 & 配置引导

打开磁盘管理，创建一个 512MB 的分区，我们将把 Live ISO 文件的内容复制到这个分区上，然后从这个分区引导。格式化为 FAT32，这样 Windows 和 Linux 都能识别。分配盘符 `H:`。记下它在硬盘上的顺序。

再创建一个 10GB 的分区，这将是 Alpine 的根分区。不要格式化，也不要分配盘符。

使用 7-Zip 之类的压缩软件打开 ISO 镜像，将其中的文件全部提取到 `H:\`。

下载 [grub4dos](http://grub4dos.chenall.net/categories/downloads/)，这是一个多功能启动引导管理器。注意不要错误地下载 UEFI 版。打开压缩包，将 `grldr` 文件复制到 `H:\`。

在 `H:\` 中创建一个纯文本文件，命名为 `menu.lst`，这是 grub4dos 的启动配置文件。在这个文件中写入下面的内容：

```
title Alpine Linux (Live)
# 1 是 H: 在磁盘上的顺序，从 0 开始计数。在我的电脑上，H: 是第二个分区，所以是 1。
root (hd0,1)
kernel /boot/vmlinuz-lts
initrd /boot/initramfs-lts
```

我们将采用链式启动的方法：利用 Windows 启动管理器启动 grub4dos，再从 grub4dos 中启动 Linux，这是因为 Windows 启动管理器无法直接启动 Linux 内核。

以管理员身份运行命令提示符，输入以下命令：

```cmd
bcdedit /create /d "GRUB4DOS" /application BOOTSECTOR
```

这将会在 Windows 启动管理器中创建一个名为 GRUB4DOS 的条目，它会返回一个 GUID，记下它。

继续配置 GRUB4DOS 引导项：

```cmd
bcdedit /set {你的GUID} device partition=H:
bcdedit /set {你的GUID} path \grldr
bcdedit /set {你的GUID} description "GRUB4DOS"
bcdedit /displayorder {你的GUID} /addlast
```

重启电脑，选择 GRUB4DOS 引导项，进入 Alpine Linux 的 Live 环境。

## 3. 安装

看到登录提示符 `localhost login:` 时，输入 root 登录，没有密码。

安装一些必要的软件包（Live 环境中自带离线包，无需联网）：

```bash
# mkfs.ext4 需要
apk add e2fsprogs
```

列出所有分区：

```bash
fdisk -l
```

找到我们刚才创建的 10G 分区，记下它对应的设备节点，在我这里是 `/dev/sda3`。注意看它的分区类型，此时应该是 FAT16。

使用 `fdisk` 修改它的分区类型为 Linux，否则 Linux 无法正确识别：

```
fdisk /dev/sda
Command (m for help): type
Partition number (1-4): 3
Hex code or alias (type L to list all codes): 83
Command (m for help): write
The partition table has been altered.
Syncing disks.
```

再次运行 `fdisk -l`，此时 `/dev/sda3` 的那一行分区类型应该变成了 Linux。

将 `/dev/sda3` 格式化为 ext4：

```bash
mkfs.ext4 /dev/sda3
```

运行安装程序：

```bash
setup-alpine
```

安装程序会提示你设置时区、键盘布局、配置网络、设置 APK 源、创建新用户等，跟着说明一步步操作即可。在最后一步选择安装目标时，不要选择，直接按回车退出，我们会手动配置引导。

将 `/dev/sda3` 挂载到 `/mnt`：

```bash
mount /dev/sda3 /mnt
```

运行磁盘安装命令：

```bash
setup-disk -m sys /mnt
```

安装程序会复制文件，等待它进度条走到 100% 自动退出。不要急着重启，我们还要手动复制无线网卡的固件，否则无法联网：

```bash
# 根据你的网卡型号，找到对应的固件
cp /lib/firmware/iwlwifi-3945-2.ucode.zst /mnt/lib/firmware/
```

重启：

```bash
reboot
```

重启后进入 Windows，编辑 `H:\menu.lst`，加入以下内容：

```
title Alpine Linux
root (hd0,2)
kernel /boot/vmlinuz-lts root=/dev/sda3 rootfstype=ext4
initrd /boot/initramfs-lts
```

再次重启即可进入 Alpine Linux。

Alpine 默认安装 syslinux 引导器，但是我们不会使用它，而是继续使用 grub4dos，因为这样无需修改 MBR/PBR，更方便也更安全，不用担心会破坏 Windows 的引导。可以手动卸载 syslinux。

## 4. 时间

类 Unix 操作系统一般将硬件时间视为 UTC 时间，而 Windows 却将硬件时间视为本地时间，因此进入 Alpine Linux 后，你可能发现系统时间比真实时间快了 8 小时，这是 Windows + Linux 双系统常见的问题。

在 Alpine 上，要解决这个问题，需要调整 OpenRC hwclock 服务的配置。

OpenRC 服务的配置位于 `/etc/conf.d`，编辑 `/etc/conf.d/hwclock`，找到这一行：

```
clock="UTC"
```

改成：

```
clock="local"
```

保存然后重启。

## 5. 安装必要的工具

Alpine 非常精简，装好之后连 `sudo` 都没有，当然要安装它。先用 root 登录，运行：

```bash
apk add sudo
```

然后编辑 `/etc/sudoers`，运行 `visudo` 然后在最后一行加入：

```
<username> ALL=(ALL) ALL
```

退出 root，用之前创建的新用户登录。

我们继续安装一些必要的软件包：

```bash
# 开发工具
sudo apk add git build-base
# BusyBox 自带 vi，但功能不全
sudo apk add vim
# BusyBox 的 mount 同样功能不全，可选择性安装：
sudo apk add mount-utils
# 用于辨别文件类型
sudo apk add file
```

现在你已经有了一个完整的命令行操作系统了。

## 6. CPU 微码

由于现代 CPU 非常复杂，其中可能存在一些设计/实现上的错误或漏洞。CPU 微码是一种特殊的固件，可以控制 CPU 的行为，从而修复或缓解这些问题，提升系统稳定性。先安装：

```bash
sudo apk add intel-ucode
# 或者
sudo apk add amd-ucode
```

微码文件会保存到 `/boot/<CPU 厂商>-ucode.img`。

挂载 grub4dos 所在的分区：

```bash
sudo mount /dev/sda2 /mnt
```

编辑 `/mnt/menu.lst`：

```bash
# 用什么文本编辑器都行，但是不要用 BusyBox vi，它无法正确识别 CRLF 换行符
sudo vim /mnt/menu.lst
```

在原本的 initrd 配置**之前**添加一行：

```
title Alpine Linux
root (hd0,2)
kernel /boot/vmlinuz-lts root=/dev/sda3 rootfstype=ext4
initrd /boot/intel-ucode.img
# 或者 initrd /boot/amd-ucode.img
initrd /boot/initramfs-lts
```

重启，运行 `sudo dmesg | grep microcode`，看到类似这样的输出就说明微码已经成功加载：

```
[    0.495072] microcode: Current revision: 0x000000a4
[    0.495078] microcode: Updated early from: 0x000000a1
```

## 7. 安装桌面环境

首先安装显卡驱动：

```bash
# 根据你的显卡型号选择
# 详见 https://wiki.alpinelinux.org/wiki/Graphics_driver
sudo apk add mesa-dri-gallium
```

运行 `setup-desktop` 脚本：

```bash
sudo setup-desktop
```

脚本会提示你选择一个桌面环境，可选项有：

- KDE Plasma
- Gnome
- MATE
- Xfce
- LXQt
- Sway

我选择了 Xfce，它较为轻量，同时外观也不错。之后的叙述都基于 Xfce + X11。

安装好后，重启即可进入图形界面。

如果重启后未能进入图形界面，可能是因为 `eudev` 未运行。需要将 `udev` 服务加入 `sysinit` 运行级别：

```bash
sudo rc-update add udev sysinit
sudo rc-update add udev-trigger sysinit
sudo rc-update add udev-settle sysinit
sudo rc-update add udev-postmount sysinit
```

## 8. 设置语言

编辑 `/etc/environment`，加入：

```
LANG="zh_CN.UTF-8"
LC_ALL="zh_CN.UTF-8"
```

安装本地化支持：

```bash
sudo apk add musl-locale
```

安装语言包：

```bash
sudo apk add lang
```

还需要安装中文字体，否则会显示乱码：

```bash
# 我选择思源黑体，你可以换成你喜欢的，比如文泉驿等
sudo apk add font-noto-cjk
# 可选：安装 emoji 字体
sudo apk add font-noto-emoji
```

记得在桌面环境的设置中修改默认字体，然后重启。

Firefox 则需要在它的设置中手动下载并选择中文语言包。

## 9. 安装中文输入法

安装 Fcitx5 输入法框架：

```bash
sudo apk add fcitx5
```

Fcitx5 本身只是一个框架，还需要安装插件：

```bash
# 包含拼音、五笔等常用中文输入法
sudo apk add fcitx5-chinese-addons
```

安装 GUI 工具包的输入法支持：

```bash
sudo apk add fcitx5-gtk fcitx5-qt
```

编辑 `/etc/environment`，加入：

```
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
XMODIFIERS=@im=fcitx
SDL_IM_MODULE=fcitx
GLFW_IM_MODULE=ibus
```

这次不用重启，重新登录即可在右上角看到输入法的图标。按 Ctrl + 空格即可切换输入法，使用拼音输入中文。

以上配置方法适用于 X11，Wayland 用户可以参考 [Arch Wiki](https://wiki.archlinuxcn.org/wiki/Fcitx_5)。虽然 Arch Wiki 并非针对 Alpine，但大部分内容都是通用的。

作为双拼爱好者，我当然要添加双拼输入法。安装 Configtool（如果你不介意手动编辑配置文件，可以跳过）：

```bash
sudo apk add fcitx5-configtool
```

右键输入法图标，点击“输入法设置”，在右侧的“可用输入法”中找到“双拼”，点击“◀️（添加）”按钮将它添加到“当前输入法”中。点击“🔼（上移）”按钮将“双拼”移动到第一位。点击“🛠️（配置）”按钮，可以选择双拼方案，可选的包括自然码、微软、智能 ABC、小鹤等。

你也可以参照上述方法添加五笔等输入法。

Fcitx5 的自带词库已经挺大的了，远超我预料。如果你还觉得不够用，我推荐这个[自建拼音输入法词库](https://github.com/wuhgit/CustomPinyinDictionary)。它收录了约 150 万个词，涵盖成语、俗语、诗文、地名、人名、生活用品等。去 Releases 中下载 `CustomPinyinDictionary_Fcitx.dict`，放到 `/usr/share/fcitx5/pinyin/dictionaries` 中，右键输入法图标，重启 Fcitx5 即可。

## 10. 更多网络设置

我们可以使用 `wpa_supplicant` 来连接无线网络，但是这样很麻烦。要获得更方便、更高级的网络管理，可以安装 `networkmanager`：

```bash
sudo apk add networkmanager networkmanager-tui
```

要允许非 root 用户通过 NetworkManager 管理网络，需要将他们加入到 `plugdev` 组：

```bash
# Alpine 使用 adduser/addgroup，而非一般发行版的 useradd/usermod/groupadd
sudo addgroup $USER plugdev
```

安装好后，就可以使用 `nmtui` 命令直观地管理网络了。

要想将 NetworkManager 与桌面环境集成，在图形界面中管理网络，还需要安装别的软件包，具体根据你之前选择的桌面环境而定。对于 Xfce，可以安装 `network-manager-applet`：

```bash
sudo apk add network-manager-applet
```

重启之后，可以在右上角看到一个小图标，点击它即可选择要连接的网络。设置中也会多出一项“高级网络设置”。

非 Xfce 用户可以参考 [Arch Wiki](https://wiki.archlinuxcn.org/wiki/NetworkManager)。

我的无线网卡有一个硬件开关，我每次开机时都需要手动打开它，否则系统无法启动，即使有时候我不需要网络。这是因为它对应的接口被配置成了 `auto`，因此在开机时系统会不断尝试连接。要解决这个问题，可以编辑 `/etc/network/interfaces`。

现在的 `/etc/network/interfaces` 的内容应该是这样的：

```
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp

auto wlan0
iface wlan0 inet dhcp
```

将 `wlan0` 前面的 `auto` 改成 `allow-hotplug` 就好了。现在只有打开开关后系统才会尝试连接无线网络。

## 11. 声音

安装 PipeWire（安装桌面环境时应该已经安装了，但还是手动安装以防万一）：

```bash
sudo apk add pipewire wireplumber
```

安装不同接口的兼容层：

```bash
sudo apk add pipewire-jack pipewire-pulse pipewire-alsa
```

安装 PAM（Pluggable Authentication Modules）：

```bash
sudo apk add linux-pam
```

将当前用户加入 `pipewire` 组：

```bash
sudo addgroup $USER pipewire
```

安装 `pavucontrol`，图形界面的音频设置工具：

```bash
sudo apk add pavucontrol
```

重启后即可播放声音。

遗憾的是，`pavucontrol` 与 Xfce 的集成不是很好，而 Xfce 官方的 `xfce4-mixer` 尚未进入稳定版仓库。

详情见 [Alpine Wiki](https://wiki.alpinelinux.org/wiki/Sound_Setup)。

## 12. Xfce 专用：个性化

Xfce 的默认主题只能说还行。可以前往 [xfce-look.org](https://www.xfce-look.org/) 寻找心仪的主题，然后手动安装。比如，我找到了一个看起来不错的复古风主题 [IndigoMagic](https://www.xfce-look.org/p/1371886)。这个主题包含了图标包和鼠标指针，但有的主题不含，需单独下载。下载 IndigoMagic，然后解压它：

```bash
cd 下载
sudo tar -xzf IndigoMagic.tar.gz -C /
```

然后前往“设置”->“外观”->“样式”，选择“IndigoMagic”，开启下方的“如有则设置其匹配 Xfwm4 主题”开关。再点击“图标”选项卡，选择“sgi elementary Xfce”。再前往“设置”->“鼠标和触摸板”，在“主题”中选择“redSGI”。

然而，IndigoMagic 是一个 GTK2/3 主题，无法应用于 GTK4 软件。我们刚才安装的 `pavucontrol` 就是 GTK4 的，因此它的界面并没有应用上主题。在 `/usr/share/themes/IndigoMagic/` 中，只有 `gtk-2.0`、`gtk-3.0` 和 `xfwm4` 目录，没有 `gtk-4.0`。但是我们可以直接创建一个名为 `gtk-4.0` 的符号链接，指向 `gtk-3.0`：

```bash
cd /usr/share/themes/IndigoMagic
sudo ln -s gtk-3.0 gtk-4.0
```

现在 `pavucontrol` 等 GTK4 软件也应用上了主题。这个方法远非完美，但起码在我这里奏效了，而且效果还不错。不过大家还是应该尽量选择 GTK4 原生主题。

但是，此时登录界面（LightDM）仍然是原来的样子。我们需要手动编辑 LightDM 的配置文件。打开 `/etc/lightdm/lightdm.conf`，找到这一行：

```
# greeter-session=...
```

改成：

```
greeter-session=lightdm-gtk-greeter
```

再编辑 `/etc/lightdm/lightdm-gtk-greeter.conf`，找到这一行：

```
# [greeter]
```

将前面的 `#` 号去掉，取消注释。

再找到：

```
# Appearance:
#  theme-name=...
#  icon-theme-name=...
#  cursor-theme-name=...
```

改成:

```
# Appearance:
theme-name=IndigoMagic
icon-theme-name=sgi elementary Xfce
cursor-theme-name=redSGI
```

重启后登录界面也应用上了主题。现在我可以假装自己有一台 90 年代的 SGI 工作站了。

如果你看腻了，想换回默认主题，前往“设置”->“外观”->“样式”，会发现其中并没有列出默认主题。前往“设置”->“设置编辑器”，在“频道”中选择“xfwm4”，在右侧找到“theme”，点击“重置”。再在“频道”中选择“xsettings”，把“ThemeName”、“CursorThemeName”也都重置。至于 LightDM，在配置文件中把改过的地方重新注释回去，然后重启即可。

如果你不小心把 LightDM 的配置改坏了，首先按 Alt + F1 或 Ctrl + Alt + F1 切换到 tty1，然后用 root 登录。先停止 LightDM 服务：

```bash
rc-service lightdm stop
```

然后删除或重命名 `/etc/lightdm` 目录：

```bash
mv /etc/lightdm /etc/lightdm.bak
```

再运行：

```bash
apk fix lightdm
```

这会重新安装 LightDM 并生成默认配置文件。再启动 LightDM 服务：

```bash
rc-service lightdm start
```

如果你把 Xfce 的配置改坏了，删除或重命名 `~/.config/xfce4` 目录，重新登录即可恢复默认配置。

## 13. 自动挂载 NTFS 分区

自内核版本 5.15 开始，原生 NTFS 驱动被并入 Linux 内核主线，不再需要 `ntfs-3g`。我们拥有了 Windows 和 Alpine Linux 双系统，要想在 Alpine 中自动挂载 Windows 所在的 NTFS 分区，可以这样做：

```bash
sudo mkdir /media/sda1
```

然后编辑 `/etc/fstab`，加入一行：

```
/dev/sda1 /media/sda1 ntfs3 ro 0 0
```

使更改立即生效：

```bash
sudo mount -a
```

因为 Linux 的 NTFS 驱动目前还不太稳定，有可能造成文件系统损坏，所以我们使用 `ro` 参数将它设置为只读。如果你足够大胆，可以将 `ro` 改为 `defaults`，允许读写。建议不要将 Windows 系统分区挂载为可写，同时及时更新 Linux 内核以获得最新的驱动程序改进。对于重要的场合，依然是使用 FAT32 最为保险。

## 14. 添加交换文件

Alpine 的确是相当轻量，全部装完后占用磁盘空间只有 3GB 多，进入桌面环境后占用内存不到 500MB。但是这台电脑内存只有 1GB，实在太少了，稍微多开一些软件就会非常卡顿。我们可以添加交换文件来解决这个问题：

```bash
# 创建 1GB 的交换文件，填充为 0
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
# 设置交换文件的权限，避免普通用户随意修改
sudo chmod 600 /swapfile
# 启用交换文件
sudo swapon /swapfile
```

要想重启后依然生效，则需要在 `/etc/fstab` 中添加一行：

```
/swapfile none swap defaults 0 0
```

然后启用 OpenRC 的 swap 服务：

```bash
sudo rc-update add swap
```

添加了 1GB 交换文件后，用 Firefox 浏览一些网页、写一些简单的程序都完全没有问题，成功实现变废为宝。

## 15. 其他提示与建议

### 15.1

要更新 Alpine 到新的 release，先编辑 `/etc/apk/repositories`，将所有的版本号（如 `v3.23`）替换为最新版（如 `v3.24`），然后运行：

```bash
sudo apk update
sudo apk upgrade --available
```

### 15.2

Alpine 使用 musl libc，无法直接运行 glibc 程序。安装软件时，优先使用官方包管理器 APK，还可以尝试 Flatpak。如果实在需要运行 glibc 程序，先安装兼容层：

```bash
sudo apk add gcompat
```

### 15.3

OpenRC 服务管理常用命令：

```bash
# 启动/停止/重启服务
rc-service <服务名> start|stop|restart

# 将服务添加到特定运行级别：
rc-update add <服务名> <运行级别>

# 将服务从特定运行级别移除
rc-update del <服务名> <运行级别>

# 常见运行级别：
# sysinit, boot, default, shutdown, reboot

# 查看特定服务的状态
rc-service <服务名> status

# 查看特定运行级别的服务
rc-update show <运行级别>

# 查看当前运行级别和服务的状态
rc-status
```

### 15.4

APK 包管理常用命令：

```bash
# 安装/卸载包
apk add|del <包名>

# 搜索包名
apk search <关键字>

# 在描述中搜索
apk search -d <关键字>

# 搜索提供特定命令的包，如 git
apk search 'cmd:git'

# 列出已安装的包
apk info

# 更新包索引
apk update

# 更新已安装的包，如果未指定包名则更新所有已安装的包
apk upgrade [<包名>]

# 换源
setup-apkrepos
```

### 15.5

网络上关于 Alpine 的资源相对较少，[Arch Wiki](https://wiki.archlinuxcn.org) 与 [Gentoo Wiki](https://wiki.gentoo.org) 有时会非常有用。
