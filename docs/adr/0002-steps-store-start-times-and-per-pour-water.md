# Steps store a start time and per-pour water; cumulative weights are derived

Authors write recipes as durations ("wait 30 s") or as scale readings ("go to 120 g"), and both are common. A Step stores its start time from the beginning of the brew and, for a Pour, the water added in that Pour. Cumulative scale targets and total brew time are derived. Start times let the Session clock find its position from wall-clock time and let early advance shift later Steps by a simple offset, and per-pour amounts make proportional scaling to whole grams straightforward.
