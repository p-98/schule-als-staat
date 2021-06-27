prefixes:
    - type: T
    - interface: I

imports:
    1. node_modules imports
    2. node_modules style imports
    3. local imports
    4. local style imports
This is because otherwise css import order might be messed up through importing the same file as one of the local modules
