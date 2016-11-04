#include <ncurses.h>

int main(int argc, char** argv) {
    initscr();
    raw();
    printw("How am I going to do this?");

    getch();
    endwin();

    return 0;
}
