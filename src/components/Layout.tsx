import { ReactNode } from "react";
import BottomNavigation from "./BottomNavigation";

type LayoutProps = {
  children: ReactNode;
  currentPage: string;
  onChangePage: (page: string) => void;
};

export default function Layout({
  children,
  currentPage,
  onChangePage,
}: LayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          paddingBottom: "70px",
        }}
      >
        {children}
      </div>

      <BottomNavigation
        currentPage={currentPage}
        onChangePage={onChangePage}
      />
    </div>
  );
}
