#include <climits>
#include <iostream>
#include <stdexcept>
#include <string>

#include "argand/complex.hpp"

using Number = argand::Complex<double>;

namespace {
void require(bool value, const char* message) {
    if (!value)
        throw std::runtime_error(message);
}

void near(Number value, std::complex<double> expected) {
    const double error = std::abs(argand::as_standard(value) - expected);
    require(error <= 2e-12 * (1 + std::abs(expected)), "Complex comparison failed.");
}

template <class Error, class Function>
void rejects(Function operation) {
    try {
        operation();
    } catch (const Error&) {
        return;
    }
    throw std::runtime_error("Expected rejection.");
}
}  // namespace

int main(int argc, char** argv) {
    if (argc != 2)
        return 2;
    const std::string check = argv[1];
    const double pi = std::acos(-1.0);
    try {
        if (check == "arithmetic") {
            for (int a = -3; a <= 3; ++a)
                for (int b = -2; b <= 2; ++b) {
                    Number z(a, b);
                    const Number w(b + 0.5, a - 0.25);
                    const auto s = argand::as_standard(z), t = argand::as_standard(w);
                    near(z + w, s + t);
                    near(z - w, s - t);
                    near(z * w, s * t);
                    near(z / w, s / t);
                    near(z.conjugate(), std::conj(s));
                    require(z == Number(a, b), "Operands changed.");
                }
            near(Number(1e180, 1e180) / Number(1e180, -1e180), {0, 1});
        } else if (check == "aliasing") {
            Number z(2, -3);
            z *= z;
            near(z, {-5, -12});
            z /= z;
            near(z, {1, 0});
            z += z;
            near(z, {2, 0});
            z -= z;
            near(z, {0, 0});
            static_assert(std::is_same_v<decltype(z + z), Number>);
        } else if (check == "polar") {
            for (const Number z : {Number(0, 2), Number(-2, 1), Number(-1, -2), Number(3, -4)}) {
                near(Number::polar(z.magnitude(), z.argument()), argand::as_standard(z));
            }
            require(std::abs(Number(-1, 0.0).argument() - pi) < 1e-14, "Upper side of cut.");
            require(std::abs(Number(-1, -0.0).argument() + pi) < 1e-14, "Lower side of cut.");
            argand::Complex<float> small(3, 4);
            require(small.magnitude() == 5.0f, "Float instantiation.");
        } else if (check == "powers") {
            const Number z(0.75, 0.4);
            for (int n = -8; n <= 8; ++n)
                near(argand::power(z, n), std::pow(argand::as_standard(z), n));
            near(argand::power(Number(0, 1), INT_MIN), {1, 0});
            near(argand::power(Number{}, 0), {1, 0});
        } else if (check == "roots") {
            for (unsigned n = 1; n <= 12; ++n) {
                Number z(-2, 1);
                auto roots = argand::roots(z, n);
                require(roots.size() == n, "Root count.");
                for (std::size_t k = 0; k < n; ++k) {
                    near(argand::power(roots[k], static_cast<int>(n)), argand::as_standard(z));
                    if (n > 1)
                        near(roots[(k + 1) % n] / roots[k], std::polar(1.0, 2 * pi / n));
                }
            }
            for (auto v : argand::roots(Number{}, 5))
                require(v == Number{}, "Zero multiplicity.");
        } else if (check == "functions") {
            const Number z(0.4, -0.7);
            const auto s = argand::as_standard(z);
            near(argand::exp(z), std::exp(s));
            near(argand::log(z), std::log(s));
            near(argand::sin(z), std::sin(s));
            near(argand::cos(z), std::cos(s));
            near(argand::tan(z), std::tan(s));
            near(argand::sinh(z), std::sinh(s));
            near(argand::cosh(z), std::cosh(s));
            near(argand::tanh(z), std::tanh(s));
            near(argand::exp(argand::log(z)), s);
        } else if (check == "domains") {
            rejects<std::domain_error>([] { (void)(Number(1) / Number{}); });
            rejects<std::domain_error>([] { argand::log(Number{}); });
            rejects<std::domain_error>([] { argand::power(Number{}, -1); });
            rejects<std::domain_error>([] { Number::polar(-1, 0); });
            rejects<std::invalid_argument>([] { argand::roots(Number(1), 0); });
            rejects<std::invalid_argument>([] { argand::roots(Number(1), 4097); });
        } else
            return 2;
    } catch (const std::exception& error) {
        std::cerr << check << ": " << error.what() << '\n';
        return 1;
    }
    return 0;
}
