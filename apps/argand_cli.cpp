#include <climits>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

#include "argand/complex.hpp"

namespace {
using Number = argand::Complex<double>;

double numeric(const std::string& text) {
    std::size_t used;
    const double value = std::stod(text, &used);
    if (used != text.size() || !std::isfinite(value))
        throw std::invalid_argument("Expected a finite coordinate.");
    return value;
}

int integer(const std::string& text) {
    std::size_t used;
    const long value = std::stol(text, &used);
    if (used != text.size() || value < INT_MIN || value > INT_MAX)
        throw std::invalid_argument("Expected an integer exponent.");
    return static_cast<int>(value);
}

std::vector<Number> calculate(const std::string& op, Number z, Number w, int n) {
    if (op == "multiply")
        return {z * w};
    if (op == "divide")
        return {z / w};
    if (op == "add")
        return {z + w};
    if (op == "subtract")
        return {z - w};
    if (op == "conjugate")
        return {z.conjugate()};
    if (op == "power")
        return {argand::power(z, n)};
    if (op == "roots") {
        if (n < 1)
            throw std::invalid_argument("Root degree must be positive.");
        return argand::roots(z, static_cast<unsigned>(n));
    }
    throw std::invalid_argument("Unknown operation.");
}

void pair(std::ostream& out, Number z) {
    out << '[' << z.real() << ',' << z.imag() << ']';
}

void write_fixtures(const char* path) {
    std::ofstream out;
    out.exceptions(std::ios::badbit | std::ios::failbit);
    out.open(path, std::ios::binary);
    out << std::setprecision(16) << "[\n";
    bool first = true;
    for (auto op : {"multiply", "divide", "add", "subtract", "conjugate", "power", "roots"}) {
        for (Number z :
             {Number(1, 1), Number(-2, 0.5), Number(0, -1), Number(-8, 0), Number(0, 0)}) {
            const Number w(-0.5, 1.25);
            const int n = 3;
            if (!first)
                out << ",\n";
            first = false;
            out << "{\"op\":\"" << op << "\",\"z\":";
            pair(out, z);
            out << ",\"w\":";
            pair(out, w);
            out << ",\"n\":" << n << ",\"results\":[";
            auto results = calculate(op, z, w, n);
            for (std::size_t k = 0; k < results.size(); ++k) {
                if (k)
                    out << ',';
                pair(out, results[k]);
            }
            out << "]}";
        }
    }
    out << "\n]\n";
    out.close();
}

void usage() {
    std::cout << "argand_cli multiply|divide|add|subtract Z_RE Z_IM W_RE W_IM\n"
                 "argand_cli conjugate Z_RE Z_IM\n"
                 "argand_cli roots|power Z_RE Z_IM N\n"
                 "argand_cli --fixtures FILE\n"
                 "Output columns: index,real,imaginary,magnitude,argument_rad\n";
}
}  // namespace

int main(int argc, char** argv) {
    try {
        if (argc == 1 || (argc == 2 && std::string(argv[1]) == "--help")) {
            usage();
            return 0;
        }
        const std::string op = argv[1];
        if (op == "--fixtures" && argc == 3) {
            write_fixtures(argv[2]);
            return 0;
        }
        const bool binary = op == "multiply" || op == "divide" || op == "add" || op == "subtract";
        const bool indexed = op == "power" || op == "roots";
        if ((!binary && !indexed && op != "conjugate") || argc != (binary ? 6 : indexed ? 5 : 4)) {
            throw std::invalid_argument("Invalid operation or arity. Run --help for examples.");
        }
        const Number z(numeric(argv[2]), numeric(argv[3]));
        const Number w = binary ? Number(numeric(argv[4]), numeric(argv[5])) : Number{};
        auto results = calculate(op, z, w, indexed ? integer(argv[4]) : 0);
        std::cout << std::setprecision(15) << "index,real,imaginary,magnitude,argument_rad\n";
        for (std::size_t k = 0; k < results.size(); ++k) {
            const auto value = results[k];
            std::cout << k << ',' << value.real() << ',' << value.imag() << ',' << value.magnitude()
                      << ',';
            if (value != Number{})
                std::cout << value.argument();
            std::cout << '\n';
        }
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "argand_cli: " << error.what() << '\n';
        return 2;
    }
}
