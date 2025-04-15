import React from "react";
import { FaChevronLeft } from "react-icons/fa";

const Header = () => {
  return (
    <div className="w-full px-4 py-2 bg-white flex items-center justify-between h-14">
      <FaChevronLeft className="cursor-pointer" />
      <div className="flex items-center">
        <h1 className="text-base text-center font-light">Book Details</h1>
      </div>
      <div className="w-5"></div> {/* Empty div to maintain spacing */}
    </div>
  );
};

export default Header;
