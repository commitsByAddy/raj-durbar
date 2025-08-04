import {
    type RouteConfig,
    route, index,
} from "@react-router/dev/routes";

export default [
    index("./home.tsx"),
    route("/", "./pages/HomePage.tsx"),
    // pattern ^           ^ module file
] satisfies RouteConfig;