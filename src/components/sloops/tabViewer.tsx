import React from "react";
import { type Tab } from "~/utils/types";
import { ScrollArea } from "../ui/scroll-area";
import Carousel from "../carousel";
import NoData from "../noData";

interface TabViewerProps {
  tabs: Tab[];
}

const TabViewer: React.FC<TabViewerProps> = ({ tabs }) => {
  if (tabs.length <= 0) return <NoData>No composition.</NoData>;

  return (
    <ScrollArea className="section mono flex-1 p-0">
      <div className="space-y-2 p-2">
        {tabs.map((tab, index) => (
          <Carousel key={index} className="section flex border-none">
            <div>
              {tab.head.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
            {tab.frets.map((fret, fretIndex) => (
              <div key={fretIndex} className="w-fit flex-col px-1 text-center">
                {fret.map((note, i) => (
                  <p key={i}>{note}</p>
                ))}
              </div>
            ))}
          </Carousel>
        ))}
      </div>
    </ScrollArea>
  );
};
export default TabViewer;
