import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerIcon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerIcon,
}) => {
  return (
    <div
      className={`bg-dark-800 rounded-lg p-6 border border-dark-700 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {headerIcon && <span className="mr-3">{headerIcon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;
