import { memo } from "react";
import { motion } from "framer-motion";

import OptionItem from "./OptionItem";
import { staggerList, staggerListItem } from "@/lib/motion";

function OptionList({ options, selected, onSelect }) {
  return (
    <motion.div
      variants={staggerList(0.05)}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {options.map((option, index) => (
        <motion.div key={option} variants={staggerListItem}>
          <OptionItem
            label={option}
            index={index}
            selected={selected === option}
            onClick={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default memo(OptionList);
