import React from "react";
import Image from "next/image";
import cx from "clsx";

import styles from "./FactionSwitcher.module.css";

type FactionSwitcherProps = {
  faction: "mc" | "elf";
  onToggle: () => void;
  size?: number;
  className?: string;
};

const FactionSwitcher = ({
  faction,
  onToggle,
  size = 64,
  className,
}: FactionSwitcherProps) => {
  return (
    <div
      className={cx(styles.container, className)}
      style={{ width: size, height: size }}
      onClick={onToggle}
    >
      <Image
        draggable={false}
        src="/image/factions/mc_badge.png"
        alt="MC Badge"
        width={size}
        height={size}
        className={cx(styles.image, styles.mc, {
          [styles.active]: faction === "mc",
        })}
      />
      <Image
        draggable={false}
        src="/image/factions/elf_badge.png"
        alt="Elf Badge"
        width={size}
        height={size}
        className={cx(styles.image, styles.elf, {
          [styles.active]: faction === "elf",
        })}
      />
    </div>
  );
};

export default FactionSwitcher;
