# Complex Plane Studio

[Interactive Argand diagram](https://pialbertshi.github.io/Complex-Plane-Studio/) · [中文说明](README.zh-CN.md)

Complex Plane Studio pairs a header-only C++17 complex-number library with an interactive Argand diagram. The diagram represents arithmetic as transformations of vectors in the plane. The command-line tool returns the corresponding Cartesian coordinates, magnitude and argument for each result.

[![Multiplication by i rotates a vector through a right angle, and the five roots of unity form a regular pentagon](docs/preview.png)](https://pialbertshi.github.io/Complex-Plane-Studio/)

## Geometric transformations

| Operation | Input | Result and interpretation |
|---|---|---|
| Multiplication | $(2+i)i$ | $-1+2i$. The vector rotates 90° counterclockwise and retains its length $\sqrt{5}$. |
| Fifth roots of unity | $z^5=1$ | Five points form a regular pentagon on the unit circle, with 72° between adjacent roots. |
| Conjugation | $z=2+1.5i$ | $\bar z=2-1.5i$. The two points have the same real coordinate and lie at equal distances on opposite sides of the real axis. |

The interface supports addition, subtraction, multiplication, division, conjugation, integer powers and all $n$-th roots. Equal axis scales preserve angles and distances under rotation and reflection. The result table gives the coordinates, modulus and argument of each output, including every branch for roots.

## Library and conventions

```cpp
#include "argand/complex.hpp"

using Number = argand::Complex<double>;
const Number z{2.0, 1.0};
const auto turned = z * Number{0.0, 1.0};  // -1 + 2i
const auto values = argand::roots(Number{-8.0, 0.0}, 3);
```

| Operation | Convention |
|---|---|
| Arithmetic | Binary operators return values. Compound assignment updates the left operand and supports self-multiplication and self-division for nonzero inputs. |
| Polar form | The radius is nonnegative. The C++ argument uses `atan2` and radians. The web interface reports degrees. The CLI leaves the argument blank at zero. |
| Integer powers | Exponentiation by squaring handles positive and negative integer powers. The zero exponent returns one. A negative power of zero raises a domain error. |
| Roots | For $z\ne 0$, root $k$ has magnitude $\lvert z\rvert^{1/n}$ and argument $(\arg z+2\pi k)/n$ for $k=0,\ldots,n-1$. At zero, the list retains multiplicity. |
| Elementary functions | The principal logarithm, exponential, trigonometric and hyperbolic functions use the standard complex library. Division by zero and the logarithm of zero raise domain errors. |

The native type accepts floating-point scalars and the root API supports degrees 1 through 4096. The plot accepts coordinates from −12 to 12, integer powers from −12 to 12 and root degrees from 1 to 12. [C++ header](include/argand/complex.hpp) · [Command-line implementation](apps/argand_cli.cpp)

## Verification

I use `std::complex` to check arithmetic results and the identity $w_k^n=z$ to verify the calculated roots. The root checks also compare the angular spacing between successive nonzero roots. Seven native test groups cover arithmetic, aliasing, polar conventions, integer powers, roots, elementary functions and invalid domains.

The browser evaluates its own JavaScript implementation. Continuous integration exports 35 C++ cases and compares all 45 complex outputs with the browser module, including the ordering of the roots. [Native tests](tests/complex_checks.cpp) · [Browser comparison](tests/check_browser.mjs)

## Build and run

The project requires a C++17 compiler and CMake 3.20 or newer.

```sh
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
ctest --test-dir build -C Release --output-on-failure
./build/argand_cli multiply 2 1 0 1
./build/argand_cli roots -8 0 3
```

With Visual Studio on Windows, the executable is `build\Release\argand_cli.exe`. The CLI exports CSV columns for the index, real part, imaginary part, modulus and argument in radians. For $z^3=-8$, it returns $1+\sqrt{3}\,i$, $-2$ and $1-\sqrt{3}\,i$ in that order, to floating-point precision.

The commands below run the browser comparison and serve the interface at `http://localhost:8000`.

```sh
./build/argand_cli --fixtures build/reference.json
node tests/check_browser.mjs build/reference.json
python -m http.server 8000 --directory docs
```

The project figure is generated from the command-line output with Matplotlib. [Figure script](tools/render_preview.py)
