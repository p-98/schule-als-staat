import { List, SimpleListItem } from "Components/material/list";
import { Typography } from "Components/material/typography";
import { Card, CardHeader, CardSubtitle } from "Components/material/card";

// local
import { currency } from "Utility/data";
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
                                {currency(product.revenue, {
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
