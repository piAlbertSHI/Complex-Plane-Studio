# 复平面运算工作室

[在线复平面演示](https://pialbertshi.github.io/Complex-Plane-Studio/) · [English](README.md)

本项目由 C++17 复数运算库、命令行工具和交互式复平面组成。复平面将乘法、共轭和开根分别表示为向量的旋转与缩放、关于实轴的反射，以及圆周上等角间隔的点。结果表同步给出实部、虚部、模和辐角，便于在代数表达与几何表示之间核对结果。

[![复数乘以 i 产生的直角旋转，以及五次单位根构成的正五边形](docs/preview.png)](https://pialbertshi.github.io/Complex-Plane-Studio/)

## 典型变换

| 运算 | 输入 | 结果与几何意义 |
|---|---|---|
| 复数乘法 | $(2+i)i$ | 结果为 $-1+2i$。向量绕原点逆时针旋转 90°，模保持为 $\sqrt{5}$。 |
| 五次单位根 | $z^5=1$ | 五个根位于单位圆上，相邻根的圆心角为 72°，依次连接构成正五边形。 |
| 共轭 | $z=2+1.5i$ | $\bar z=2-1.5i$。两点实部相同，位于实轴两侧，到实轴的距离相等。 |

界面支持加、减、乘、除、共轭、整数幂和全部 $n$ 次根。实轴和虚轴使用相同比例尺，旋转与反射的几何关系在窗口缩放时保持一致。

## 接口与数学约定

`argand::Complex<T>` 是仅需头文件的浮点复数类型。二元算术运算返回独立的值，复合赋值更新左操作数。库以弧度表示辐角，网页以角度显示。零的辐角在命令行结果中留空。整数幂采用平方求幂算法，除以零、零的负整数幂及零的对数均触发定义域错误。[C++ 头文件](include/argand/complex.hpp)

对非零复数 $z$，第 $k$ 个 $n$ 次根的模为 $\lvert z\rvert^{1/n}$，辐角为 $(\arg z+2\pi k)/n$，按 $k=0,\ldots,n-1$ 排列。输入为零时保留根的重数。C++ 接口支持 1 至 4096 次根，网页展示 1 至 12 次根。

## 数值验证

我使用 `std::complex` 核对算术结果。对每组非零复数的全部根，分别检查幂运算回代 $w_k^n=z$ 和相邻根的角间距。7 组 C++ 测试覆盖算术、变量自乘与自除、极坐标约定、整数幂、开根、初等函数及定义域。

网页运算使用独立的 JavaScript 实现。持续集成从 C++ 导出 35 个算例，将其中的 45 个复数结果与网页模块逐项核对，开根结果同时核对返回顺序。[原生测试](tests/complex_checks.cpp) · [网页计算核对](tests/check_browser.mjs)

## 构建与示例

项目需要 C++17 编译器和 CMake 3.20 或更高版本。

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
./build/argand_cli multiply 2 1 0 1
./build/argand_cli roots -8 0 3
```

使用 Visual Studio 构建时，Windows 可执行文件位于 `build\Release\argand_cli.exe`。第二个算例给出 $-8$ 的三个立方根，依次为 $1+\sqrt{3}\,i$、$-2$ 和 $1-\sqrt{3}\,i$。命令行以 CSV 输出各根的坐标、模和辐角。
