import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createHashRouter, RouterProvider} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import MenuPage from "./pages/MenuPage.tsx";
import NoPage from "./pages/NoPage.tsx";
import ContactPage from "./pages/ContactPage.tsx";
import BookingPage from "./pages/BookingPage.tsx";

const router = createHashRouter([
    {path:"/", element: <HomePage /> },
    {path:"/home", element: <HomePage /> },
    {path:"/menu", element: <MenuPage /> },
    {path:"/hours", element: <ContactPage /> },
    {path:"/booking", element : <BookingPage/> },
    {path:"/*", element: <NoPage /> }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <RouterProvider router={router}/>
  </StrictMode>,
)
