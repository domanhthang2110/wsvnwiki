export const getArrowTransform = (direction: 'right' | 'down' | 'left' | 'up' | null) => {
  switch (direction) {
    case 'down':
      return 'rotate(90deg)';
    case 'left':
      return 'rotate(180deg)';
    case 'up':
      return 'rotate(270deg)';
    default:
      return 'none';
  }
};
