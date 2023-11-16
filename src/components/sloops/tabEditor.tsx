import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "~/utils/shadcn/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import Carousel from "../carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEditorContext } from "~/contexts/editor";
import NoData from "../noData";
import { tuning } from "~/utils/constants";
import { type Tab } from "~/utils/types";

const TabEditor: React.FC = ({}) => {
  const editor = useEditorContext();
  const [tabs, setTabs] = useState<Tab[]>(
    editor.playingLoop && editor.playingLoop.composition !== ""
      ? (JSON.parse(editor.playingLoop.composition) as Tab[])
      : []
  );
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [clipboard, setClipboard] = useState<string[][]>([]);
  const empty = ["-", "-", "-", "-", "-", "-"];
  const mods = [
    "-",
    "x",
    "h",
    "p",
    "b",
    "v",
    "r",
    "t",
    "T",
    "s",
    "S",
    "*",
    "/",
    "\\",
  ];

  useEffect(() => {
    if (!editor.playingLoop) return;
    editor.setLoops(
      editor.loops.map((loop) => {
        if (loop.id === editor.playingLoop?.id) {
          return { ...loop, composition: JSON.stringify(tabs) };
        }
        return loop;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.playingLoop, tabs]);

  if (!editor.playingLoop) return <NoData>No loop.</NoData>;

  return (
    <>
      <div className="section mb-2 flex gap-2">
        <div className="flex flex-1 gap-2">
          <Button
            onClick={() => {
              const notes = tuning[editor.generalInfo?.tuning]?.notes;
              if (!notes) {
                toast.error("Something went wrong. Please Refresh.");
                return;
              }
              setTabs((curr) => [
                ...curr,
                {
                  head: notes
                    .reverse()
                    .map((note) =>
                      note.length > 1 ? `${note}|` : `${note} |`
                    ),
                  frets: [],
                },
              ]);
            }}
            variant="outline"
            className="mono"
          >
            Add Row
          </Button>
          <Button
            onClick={() => {
              if (selectedTab === null) {
                toast.error("No tab selected.");
                return;
              }
              setTabs((curr) =>
                curr.map((tab, index) => {
                  if (index === selectedTab) {
                    return { ...tab, frets: [...tab.frets, empty] };
                  }
                  return tab;
                })
              );
            }}
            variant="outline"
            className="mono"
          >
            Add Column
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="mono">Edit</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" align="end" forceMount>
            {selectedTab !== null && (
              <>
                <DropdownMenuItem>
                  <Button
                    onClick={() => {
                      const tab = tabs[selectedTab];
                      if (!tab) return;
                      setTabs((curr) => [...curr, tab]);
                    }}
                    size="base"
                    variant="ghost"
                    className="mono"
                  >
                    Duplicate
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button
                    onClick={() => {
                      setTabs((curr) =>
                        curr.filter((_, index) => index !== selectedTab)
                      );
                      setSelectedTab(null);
                    }}
                    size="base"
                    variant="ghost"
                    className="mono"
                  >
                    Delete
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem>
              <Button
                onClick={() => {
                  setTabs([]);
                  setSelectedTab(null);
                }}
                variant="ghost"
                size="base"
                className="mono hover:bg-destructive hover:text-background"
              >
                Clear
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea className="section mono relative flex-1 p-0">
        {clipboard.length > 0 && (
          <div className="section absolute right-2 top-2 z-10 bg-background">
            <h1 className="section-label mb-2">Clipboard</h1>
            <div className="mb-3 flex justify-center gap-2">
              {clipboard.map((fret, index) => (
                <div className="text-center" key={index}>
                  {fret.map((note, i) => (
                    <p key={i}>{note}</p>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="destructive"
                className="mono"
                onClick={() => setClipboard([])}
              >
                Clear
              </Button>
              <Button
                onClick={() => {
                  if (selectedTab === null) {
                    toast.error("No tab selected.");
                    return;
                  }
                  setTabs((curr) =>
                    curr.map((tab, index) => {
                      if (index === selectedTab) {
                        return { ...tab, frets: [...tab.frets, ...clipboard] };
                      }
                      return tab;
                    })
                  );
                  //setClipboard([])
                }}
                className="mono"
              >
                Paste
              </Button>
            </div>
          </div>
        )}
        <div className="space-y-2 p-2">
          {tabs.map((tab, index) => (
            <Carousel
              onClick={() =>
                setSelectedTab(selectedTab === index ? null : index)
              }
              key={index}
              className={cn(
                "section flex cursor-pointer border-none hover:bg-accent",
                index === selectedTab && "bg-accent"
              )}
            >
              <div>
                {tab.head.map((note, i) => (
                  <p key={i}>{note}</p>
                ))}
              </div>
              {tab.frets.map((fret, fretIndex) => (
                <Popover key={fretIndex}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="base"
                      className={cn("w-fit flex-col py-0 hover:bg-background")}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {fret.map((note, i) => (
                        <p key={i}>{note}</p>
                      ))}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-lg w-fit space-y-2 p-2 font-sans">
                    {fret.map((note, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 items-center gap-2"
                      >
                        <p>{tab.head[i]?.replace("|", "")}</p>
                        <Select
                          onValueChange={(value) =>
                            setTabs((curr) =>
                              curr.map((t, ti) => {
                                if (ti === index) {
                                  return {
                                    ...t,
                                    frets: t.frets.map((f, fi) => {
                                      if (fi === fretIndex) {
                                        return f.map((n, ni) =>
                                          ni === i ? value : n
                                        );
                                      }
                                      return f;
                                    }),
                                  };
                                }
                                return t;
                              })
                            )
                          }
                          defaultValue={note}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="note / mod" />
                          </SelectTrigger>
                          <SelectContent>
                            {mods.map((mod, modIndex) => (
                              <SelectItem
                                className="p-lg font-sans"
                                key={modIndex}
                                value={mod}
                              >
                                {mod}
                              </SelectItem>
                            ))}
                            {Array.from({ length: 26 }).map((_, num) => (
                              <SelectItem
                                className="p-lg font-sans"
                                key={num}
                                value={(num + 1).toString()}
                              >
                                {num + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <PopoverClose asChild>
                      <Button
                        onClick={() => {
                          if (clipboard.length < 10) {
                            setClipboard((curr) => [...curr, fret]);
                          } else {
                            toast.error("Your clipboard is full.");
                          }
                        }}
                        variant="outline"
                        className="mono w-full"
                      >
                        Copy
                      </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                      <Button
                        onClick={() =>
                          setTabs((curr) =>
                            curr.map((t, i) => {
                              if (i === index) {
                                return {
                                  ...t,
                                  frets: t.frets.filter(
                                    (_, ti) => ti !== fretIndex
                                  ),
                                };
                              }
                              return t;
                            })
                          )
                        }
                        variant="destructive"
                        className="mono w-full"
                      >
                        Delete
                      </Button>
                    </PopoverClose>
                  </PopoverContent>
                </Popover>
              ))}
            </Carousel>
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
export default TabEditor;
