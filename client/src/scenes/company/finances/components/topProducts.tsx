import { List, SimpleListItem } from "@rmwc/list";
import { Typography } from "@rmwc/typography";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import { Card, CardHeader, CardSubtitle } from "Components/card/card";
import { parseCurrency } from "Utility/parseCurrency";
import { products } from "../finances.data";

const topListSales = products.sort((p1, p2) => {
    if (p1.sales !== p2.sales) {
        return p1.sales > p2.sales ? -1 : 1;
    }

    return 0;
});
const topListRevenue = products.sort((p1, p2) => {
    if (p1.revenue !== p2.revenue) {
        return p1.revenue > p2.revenue ? -1 : 1;
    }

    return 0;
});

export const TopSales: React.FC = () => (
    <Card>
        <CardHeader>
            Top 3 Verkäufe
            <CardSubtitle>Produktbestenliste</CardSubtitle>
        </CardHeader>
        <List theme="textPrimaryOnBackground">
            {topListSales.map((product) => (
                <SimpleListItem
                    key={product.id}
                    text={product.name}
                    meta={
                        <div>
                            <Typography use="subtitle2" theme="primary">
                                {product.sales}
                            </Typography>
                        </div>
                    }
                />
            ))}
        </List>
    </Card>
);

export const TopRevenue: React.FC = () => (
    <Card>
        <CardHeader>
            Top 3 Umsatz
            <CardSubtitle>Produktbestenliste</CardSubtitle>
        </CardHeader>
        <List theme="textPrimaryOnBackground">
            {topListRevenue.map((product) => (
                <SimpleListItem
                    key={product.id}
                    text={product.name}
                    meta={
                        <div>
                            <Typography use="subtitle2" theme="primary">
                                {parseCurrency(product.revenue, {
                                    omitDecimals: true,
                                })}
                            </Typography>
                        </div>
                    }
                />
            ))}
        </List>
    </Card>
);
