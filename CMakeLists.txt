cmake_minimum_required(VERSION 3.20)
project(ComplexPlaneStudio LANGUAGES CXX)

add_library(argand INTERFACE)
target_include_directories(argand INTERFACE include)
target_compile_features(argand INTERFACE cxx_std_17)

add_executable(argand_cli apps/argand_cli.cpp)
target_link_libraries(argand_cli PRIVATE argand)

include(CTest)
if(BUILD_TESTING)
  add_executable(argand_checks tests/complex_checks.cpp)
  target_link_libraries(argand_checks PRIVATE argand)
  foreach(check arithmetic aliasing polar powers roots functions domains)
    add_test(NAME argand_${check} COMMAND argand_checks ${check})
  endforeach()
endif()
