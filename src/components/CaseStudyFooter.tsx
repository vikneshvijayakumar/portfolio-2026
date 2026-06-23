import { motion } from "motion/react";
import { EASE } from "../utils/constants";
import { toolbarLinks } from "../content";

interface Props {
  title: string;
  sub: string;
}

export default function CaseStudyFooter({ title, sub }: Props) {
  return (
    <motion.footer
      className="case-footer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px 200px 0px" }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div className="case-footer__inner">
        <h2 className="case-footer__title">{title}</h2>
        <p className="case-footer__sub">{sub}</p>
        <a className="download-button" href={toolbarLinks.resume} target="_blank" rel="noreferrer">
          Download Resume
        </a>
      </div>
    </motion.footer>
  );
}
