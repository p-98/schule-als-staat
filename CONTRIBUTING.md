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
-   Neither all users nor all transactions have globally unique ids. A company's id is only unique across all companies, but a citizen could have the same id.

# Git

-   non-working work-in-progress commits start "wip"

# GraphQL

-   A Connection/Edge like implementation is utilized for lists

# Naming

"signature" refers to an object containing the info to uniquely identify a specific entry in a list of similar types, which have different id spaces.  
Example of a user signature: `{type: "COMPANY", id: "..."}`

# Other

-   worktime is stored as number in seconds
-   Dates are proccessed and stored as datetime strings with format `YYYY-MM-DDThh:mm:ss.sssZ` (RFC 3339) and always in UTC. They are only converted to local time for displaying.

# Dependencies

Usage of patch-package:

-   @graphql-tools/executor-http and @graphql-tools/utils reflecting changes found in fork https://github.com/p-98/graphql-tools
