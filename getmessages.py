#!/usr/bin/env python3

import fbchat
import os
import sys


def main():
    MESSENGER_ID = os.getenv('MESSENGER_ID', '') or (sys.argv[1] if len(sys.argv) > 1 else None)
    PASSWORD = os.getenv('MESSENGER_PASSWORD', '') or (sys.argv[2] if len(sys.argv) > 2 else None)
    if not MESSENGER_ID:
        print("MESSENGER_ID unset")
        return
    if not PASSWORD:
        print("No password given")
        return

    client = fbchat.Client(MESSENGER_ID, PASSWORD)

main()
