# Prefixes

    - type: T
    - interface: I

# Imports

_This is because otherwise css import order might be messed up._

    1. node_modules imports & imports from "Components/material/*"
    2. local imports
    3. local style imports

# Props exports

Component props are only explicitly exported from "Components/material/\*" to imitate rmwc style.
Otherwise props are not export as they can be obtained using React.ComponentProps.

# Design

-   FullscreenContainerTransform is not nested

# Git

-   non-working work-in-progress commits start "wip"

# GraphQL

-   A Connection/Edge like implementation is utilized for lists
