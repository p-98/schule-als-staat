import { Grid } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import styles from "./pageGrid.module.css";

const PageGrid: React.FC = ({ children }) => (
    <Grid className={styles["page-grid"]}>{children}</Grid>
);
export default PageGrid;
