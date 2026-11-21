#pragma once

#include <cmath>
#include <complex>
#include <cstddef>
#include <stdexcept>
#include <type_traits>
#include <vector>

namespace argand {

template <class T>
class Complex {
    static_assert(std::is_floating_point_v<T>, "Complex<T> requires a floating-point type.");

   public:
    constexpr Complex(T real = T{}, T imag = T{}) : real_(real), imag_(imag) {}
    constexpr T real() const {
        return real_;
    }
    constexpr T imag() const {
        return imag_;
    }
    T magnitude() const {
        return std::hypot(real_, imag_);
    }
    T argument() const {
        return std::atan2(imag_, real_);
    }
    constexpr Complex conjugate() const {
        return {real_, -imag_};
    }

    static Complex polar(T radius, T radians) {
        if (radius < 0)
            throw std::domain_error("Radius must be nonnegative.");
        return {radius * std::cos(radians), radius * std::sin(radians)};
    }

    friend constexpr Complex operator+(Complex a, Complex b) {
        return {a.real_ + b.real_, a.imag_ + b.imag_};
    }
    friend constexpr Complex operator-(Complex a, Complex b) {
        return {a.real_ - b.real_, a.imag_ - b.imag_};
    }
    friend constexpr Complex operator*(Complex a, Complex b) {
        return {a.real_ * b.real_ - a.imag_ * b.imag_, a.real_ * b.imag_ + a.imag_ * b.real_};
    }
    friend Complex operator/(Complex a, Complex b) {
        if (b.real_ == 0 && b.imag_ == 0)
            throw std::domain_error("Division by zero.");
        const auto quotient = std::complex<T>(a.real_, a.imag_) / std::complex<T>(b.real_, b.imag_);
        return {quotient.real(), quotient.imag()};
    }
    constexpr Complex& operator+=(Complex other) {
        return *this = *this + other;
    }
    constexpr Complex& operator-=(Complex other) {
        return *this = *this - other;
    }
    constexpr Complex& operator*=(Complex other) {
        return *this = *this * other;
    }
    Complex& operator/=(Complex other) {
        return *this = *this / other;
    }
    friend constexpr bool operator==(Complex a, Complex b) {
        return a.real_ == b.real_ && a.imag_ == b.imag_;
    }
    friend constexpr bool operator!=(Complex a, Complex b) {
        return !(a == b);
    }

   private:
    T real_;
    T imag_;
};

template <class T>
Complex<T> power(Complex<T> base, int exponent) {
    // Form the magnitude without negating INT_MIN in a signed integer.
    unsigned remaining =
        exponent < 0 ? 0u - static_cast<unsigned>(exponent) : static_cast<unsigned>(exponent);
    if (exponent < 0)
        base = Complex<T>(1) / base;
    Complex<T> result(1);
    while (remaining) {
        if (remaining & 1u)
            result *= base;
        remaining >>= 1;
        if (remaining)
            base *= base;
    }
    return result;
}

template <class T>
std::vector<Complex<T>> roots(Complex<T> value, unsigned degree) {
    if (degree == 0 || degree > 4096)
        throw std::invalid_argument("Root degree must be between 1 and 4096.");
    const T radius = std::pow(value.magnitude(), T(1) / static_cast<T>(degree));
    const T tau = T(2) * std::acos(T(-1));
    std::vector<Complex<T>> result;
    result.reserve(degree);
    for (unsigned k = 0; k < degree; ++k) {
        result.push_back(Complex<T>::polar(radius, (value.argument() + tau * k) / degree));
    }
    return result;
}

template <class T>
std::complex<T> as_standard(Complex<T> z) {
    return {z.real(), z.imag()};
}
template <class T>
Complex<T> from_standard(std::complex<T> z) {
    return {z.real(), z.imag()};
}

template <class T>
Complex<T> exp(Complex<T> z) {
    return from_standard(std::exp(as_standard(z)));
}
template <class T>
Complex<T> log(Complex<T> z) {
    if (z == Complex<T>{})
        throw std::domain_error("The logarithm is undefined at zero.");
    return from_standard(std::log(as_standard(z)));
}
template <class T>
Complex<T> sin(Complex<T> z) {
    return from_standard(std::sin(as_standard(z)));
}
template <class T>
Complex<T> cos(Complex<T> z) {
    return from_standard(std::cos(as_standard(z)));
}
template <class T>
Complex<T> tan(Complex<T> z) {
    return from_standard(std::tan(as_standard(z)));
}
template <class T>
Complex<T> sinh(Complex<T> z) {
    return from_standard(std::sinh(as_standard(z)));
}
template <class T>
Complex<T> cosh(Complex<T> z) {
    return from_standard(std::cosh(as_standard(z)));
}
template <class T>
Complex<T> tanh(Complex<T> z) {
    return from_standard(std::tanh(as_standard(z)));
}

}  // namespace argand
