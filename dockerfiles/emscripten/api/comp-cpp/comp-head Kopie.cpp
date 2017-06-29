// RUN: %clang_cpp -c %s
#include <iostream>
#include <emscripten.h>
#include "../../comp-cpp/colors.h"

#define MAXZEILEN 5000

int zeilen = 0;

void pruefeZeilen() {
  ++zeilen;
  if( zeilen > MAXZEILEN ) {
    printf("Maximalzahl von %d Zeilen erreicht\n", MAXZEILEN);
    exit(1);
  }
}

void groesse(int x, int y) {
  // printf(">>r %d %d\n", x, y);
  EM_ASM_({
    groesse(parseInt($0),parseInt($1));
  }, x,y);
  pruefeZeilen();
}
void hintergrund(int i, int f) {
  // printf(">>b %d 0x%x\n", i, f);
  EM_ASM_({
    hintergrund(parseInt($0),$1);
  }, i,f);
  pruefeZeilen();
}
void hintergrund2(int i, int j, int f) {
  // printf(">>#b %d %d 0x%x\n", i, j, f);
  EM_ASM_({
    hintergrund2(parseInt($0),parseInt($1),$2);
  }, i,j,f);
  pruefeZeilen();
}
void flaeche(int f) {
  // printf(">>ba 0x%x\n", f);
  EM_ASM_({
    flaeche($0);
  }, f);
  pruefeZeilen();
}
void rahmen(int f) {
  // printf(">>bo 0x%x\n", f);
  EM_ASM_({
    rahmen($0);
  }, f);
  pruefeZeilen();
}
// why clear
void clear() {
  // printf(">>c\n");
  EM_ASM(
    loeschen();
  );
  pruefeZeilen();
}
void loeschen() {
  // printf(">>c\n");
  EM_ASM(
    loeschen();
  );
  pruefeZeilen();
}
void farbe(int i, int f) {
  // printf(">>%d 0x%x\n", i, f);
  EM_ASM_({
    farbe(parseInt($0),'#'+$1.toString(16));
  }, i,f);
  pruefeZeilen();
}
void farbe2(int i, int j, int f) {
  // printf(">># %d %d 0x%x\n", i, j, f);
  EM_ASM_({
    farbe2(parseInt($0),parseInt($1),'#'+$2.toString(16));
  }, i,j,f);
  pruefeZeilen();
}
void farben(int f) {
  // printf(">>a 0x%x\n", f);
  EM_ASM_({
    farbe('#'+$0.toString(16));
  }, f);
  pruefeZeilen();
}
void grau(int i, int g) {
  farbe(i, g << 16 | g <<8 | g);
}
void grau2(int i, int j, int g) {
  farbe2(i, j, g << 16 | g <<8 | g);
}
void formen(char* f) {
  printf(">>f %s\n", f);
  pruefeZeilen();
}
void form(int i, char* f) {
  printf(">>fi %d %s\n", i, f);
  pruefeZeilen();
}
void form2(int i, int j, char* f) {
  printf(">>#fi %d %d %s\n", i, j, f);
  pruefeZeilen();
}
void text(int i, char* f) {
  printf(">>T %d %s\n", i, f);
  pruefeZeilen();
}
void text2(int i, int j, char* f) {
  printf(">>#T %d %d %s\n", i, j, f);
  pruefeZeilen();
}
void zeichen(int i, char c) {
  if( c >= 32 ) {
    printf(">>T %d %c\n", i, c);
    pruefeZeilen();
  }
}
void zeichen2(int i, int j, char c) {
  if( c >= 32 ) {
    printf(">>#T %d %d %c \n", i, j, c);
    pruefeZeilen();
  }
}
void zusammen2( int i, int j, int f, char* form) {
  farbe2( i, j, f );
  form2( i, j, form );
}
void symbolGroesse(int i, double s) {
  // printf(">>s %d %g\n", i, s);
  EM_ASM_({
    symbolGroesse(parseInt($0),$1);
  }, i,s);
  pruefeZeilen();
}
void symbolGroesse2(int i, int j, double s) {
  EM_ASM_({
    symbolGroesse2(parseInt($0),parseInt($1),$2);
  }, i,j,s);
  // printf(">>#s %d %d %g\n", i, j, s);
}

int main(int, char**) {
