import Library from "@api/library";
import { IContext } from "@type/models";

export default (): IContext => ({
    dataSources: {
        Library,
    },
});
