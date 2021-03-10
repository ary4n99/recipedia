import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import Styles from "src/components/theme/styles";
import Theme from "src/components/theme";
import SearchView from "src/views/search/SearchView";
import LoginCheck, { AccessCheck } from "src/components/auth/AuthCheck";
import NotFoundView from "src/views/error/ErrorView";
import FavouritesView from "src/views/favourites/FavouritesView";
import SignUpView from "src/views/signup/SignUpView";
import SettingsView from "src/views/settings/SettingsView";
import HomeView from "src/views/home/HomeView";
import LegalView from "src/views/legal/LegalView";
import FAQView from "src/views/faq/FAQView";
import FeedbackView from "src/views/feedback/FeedbackView";

const App = () => {
  return (
    <ThemeProvider theme={Theme}>
      <Styles />
      {useRoutes([
        {
          path: "app",
          element: <AccessCheck />,
          children: [
            { path: "search", element: <SearchView /> },
            { path: "favourites", element: <FavouritesView /> },
            { path: "legal", element: <LegalView /> },
            { path: "feedback", element: <FeedbackView /> },
            { path: "faq", element: <FAQView /> },
            { path: "settings", element: <SettingsView /> },
            { path: "home", element: <HomeView /> },
            { path: "", element: <Navigate to="/app/home" /> },
            { path: "*", element: <Navigate to="/404" /> },
          ],
        },
        {
          path: "/",
          children: [
            { path: "login", element: <LoginCheck /> },
            { path: "signup", element: <SignUpView /> },
            { path: "legal", element: <LegalView /> },
            { path: "", element: <LoginCheck /> },
            { path: "*", element: <NotFoundView /> },
          ],
        },
      ])}
    </ThemeProvider>
  );
};

export default App;
