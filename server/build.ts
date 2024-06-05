import esbuild from "esbuild";
import graphqlLoaderPlugin from "@luckycatfactory/esbuild-graphql-loader";
console.log(graphqlLoaderPlugin);
import { optimizeDocumentNode } from "@graphql-tools/optimize";

await esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: "./out",
    bundle: false,
    minify: true,
    platform: "node",
    target: "node18.19.1",
    packages: "external",
    plugins: [graphqlLoaderPlugin({ mapDocumentNode: optimizeDocumentNode })],
});
