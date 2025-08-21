import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createHashRouter, RouterProvider} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import MenuPage from "./pages/MenuPage.tsx";
import NoPage from "./pages/NoPage.tsx";

const router = createHashRouter([
    {path:"/", element: <HomePage /> },
    {path:"/home", element: <HomePage /> },
    {path:"/menu", element: <MenuPage /> },
    {path:"/*", element: <NoPage /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <RouterProvider router={router}/>
  </StrictMode>,
)
