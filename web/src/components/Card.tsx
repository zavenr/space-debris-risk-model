import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerIcon?: React.ReactNode;
  status?: "success" | "warning" | "error" | "info";
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerIcon,
  status,
}) => {
  const statusColors = {
    success: "border-green-500/30 bg-green-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    error: "border-red-500/30 bg-red-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };

  const statusColor = status ? statusColors[status] : "";

  return (
    <div
      className={`bg-slate-800 rounded-xl p-6 border border-slate-700 ${statusColor} ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
          {status && (
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                status === "success"
                  ? "bg-green-500"
                  : status === "warning"
                  ? "bg-yellow-500"
                  : status === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            />
          )}
          {headerIcon && <span className="mr-3">{headerIcon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;
