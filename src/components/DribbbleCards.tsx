import { memo } from "react";
import { motion } from "motion/react";
import work1Img from "../assets/other-work-1.webp";
import work2Img from "../assets/other-work-2.webp";
import work3Img from "../assets/other-work-3.webp";
import work4Img from "../assets/orgusta-otherwork.webp";
import work7Img from "../assets/corporate-planning.webp";
import work6Img from "../assets/investor-pitchdeck.webp";

const items = [
  {
    id: 1,
    img: work6Img,
    label: "01 / Healthcare AI Pitch Deck",
    link: "https://www.figma.com/deck/1GRsT7aJxwDo8Dsc7JgJfh",
  },
  {
    id: 2,
    img: work4Img,
    label: "02 / Orgusta Logo Design",
    link: "https://www.figma.com/deck/Gav4HFOlEX7DXmJdeF8OhI",
  },
  {
    id: 3,
    img: work2Img,
    label: "03 / Tango App Exploration",
    link: "https://dribbble.com/shots/21047586-Tango-App-Exploration",
  },
  {
    id: 4,
    img: work3Img,
    label: "04 / Reiki Website",
    link: "https://dribbble.com/shots/21037521-Website-Reiki-Healing",
  },
  {
    id: 5,
    img: work7Img,
    label: "05 / Corporate Landing",
    link: "https://dribbble.com/shots/21029547-Corporate-Planning-Website",
  },
  {
    id: 6,
    img: work1Img,
    label: "06 / Healing Studio Landing",
    link: "https://dribbble.com/shots/21096185-Healing-Studio-Website-Landing",
  },
];

const layout = [
  { left: 0, top: 40, rotate: -4 },
  { left: 340, top: 0, rotate: 3 },
  { left: 700, top: 50, rotate: -2 },
  { left: -20, top: 370, rotate: 2 },
  { left: 320, top: 320, rotate: -5 },
  { left: 670, top: 380, rotate: 4 },
];

const DribbbleCards = memo(function DribbbleCards({
  isMobile = false,
  isStarted = false,
}: {
  isMobile?: boolean;
  isStarted?: boolean;
}) {
  const linkUrl = "https://dribbble.com/vikneshvijayakumar";
  return (
    <section
      className={`dribbble-cards ${isMobile ? "is-mobile" : ""}`}
      style={{ position: "absolute", left: 1700, top: 1500, width: 1160, height: 1120 }}
      data-interactive="true"
    >
      <h2
        className="dribbble-cards__title"
        style={{ position: "absolute", left: 0, top: -48, margin: 0 }}
      >
        OTHER WORKS
      </h2>

      {items.map((item, index) => {
        const slot = layout[index % layout.length];
        return (
          <motion.a
            key={item.id}
            href={item.link || linkUrl}
            target="_blank"
            rel="noreferrer"
            className="dribbble-card"
            draggable="false"
            onDragStart={(e) => e.preventDefault()}
            style={{
              position: "absolute",
              left: slot.left,
              top: slot.top,
              width: 320,
            }}
            initial={{ opacity: 0, scale: 0.9, rotate: slot.rotate }}
            animate={isStarted ? { opacity: 1, scale: 1, rotate: slot.rotate } : { opacity: 0, scale: 0.9, rotate: slot.rotate }}
            transition={{
              opacity: { duration: 0.3, delay: 0.2 + index * 0.05 },
              scale: { type: "spring", stiffness: 300, damping: 25, delay: 0.2 + index * 0.05 },
              rotate: { type: "spring", stiffness: 800, damping: 45 },
            }}
            whileHover={{ y: -12, scale: 1.05, rotate: 0, zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="dribbble-card__image-container">
              <img src={item.img} alt="" className="dribbble-card__img" draggable="false" loading="lazy" decoding="async" />
            </div>
            <div className="dribbble-card__caption">
              {item.label}
            </div>
          </motion.a>
        );
      })}
    </section>
  );
});

export default DribbbleCards;
