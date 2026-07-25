import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          paddingBottom: "70px",
          background: "#0f172a",
          color: "#ffffff",
        }}
      >
        {children}
      </main>

      <BottomNavigation />
    </>
  );
}
