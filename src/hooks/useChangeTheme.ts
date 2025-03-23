import { useContext } from "react";
import { ThemeContext } from "@/components/ThemeController";

export const useChangeTheme = () => useContext(ThemeContext);