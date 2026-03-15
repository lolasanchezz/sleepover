"use client";

import { useState, useEffect } from "react";
import PortalSidebar from "../../components/PortalSidebar";
import GradientText from "../../components/GradientText";

export default function FebChallengePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const contentOffset = isMobile
    ? "0px"
    : sidebarOpen
      ? "clamp(320px, 25vw, 520px)"
      : "96px";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#C0DEFE" }}>
      <PortalSidebar onStateChange={setSidebarOpen} />

      <main
        className="relative z-10 transition-all duration-300 p-4 md:p-8 lg:p-12 pt-16 md:pt-8 flex items-center justify-center min-h-screen"
        style={{
          marginLeft: contentOffset,
          marginRight: isMobile ? "0px" : "32px",
        }}
      >
        <div className="text-center">
          <h1 className="text-[44px] md:text-[72px] leading-[60px] md:leading-[90px] mb-16 text-left whitespace-nowrap">
            <GradientText
              gradient="linear-gradient(180deg, #B7C1F2 0%, #89A8EF 100%)"
              strokeWidth="10px"
            >
                How to Design Your First PCB
            </GradientText>
          </h1>
              <article className="max-w-4xl text-left mt-8 text-[20px] md:text-[22px] pr-4 md:pr-8" style={{ fontFamily: "'MADE Tommy Soft', sans-serif", fontSize: '1.25rem', lineHeight: '1.7' }}>
              <p className="mb-4 mt-8">This article covers the basics of all you need to know to design your first printed circuit board (PCB). If you are fairly familiar with what PCB is and what it does, feel free to jump into the instructions. If you have any feedback or questions, please slack me at <b>@afia ava</b>.</p>
              <p className="mb-4">Before you get started, you can also take your PCB project further by submitting it to Stasis! First, submit your project and get it approved from  Stasis. Then, you can submit it to the Sleepover for 2 bonus feathers. <br />You can recieve up to $300 to build hardware projects from Stasis. You'll also be on track to qualify for an in-person hardware hackathon running from May 15-18 in Austin, TX or Open Sauce Technology & Creator Festival on July 17-19, 2026 in San Francisco, CA.</p>
              <p className="mb-4">Check out more about Stasis <a href="https://stasis.hackclub.com/" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">here</a>!</p>
              <img src="/pcb-tutorial/stasis.png" alt="Stasis PCB" className="my-6 rounded-lg" />
              <h3 className="text-[34px] font-semibold mb-2 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>What is a Printed Circuit Board (PCB)?</h3>
              <p className="mb-4">A PCB is a foundational component in electronics, designed as a board (usually with fiberglass), that physically supports and electrically connects components like chips and resistors using copper traces. These are essential for routing signals in devices, ranging from simple single-layer boards to complex, multi-layer motherboards. These are used in almost every electronic device. For example, phones, laptops, cameras, robots, rockets, etc.</p>
              <p className="mb-4">You can use a breadboard to prototype; however, with a PCB, the components are soldered onto the board instead of having wires everywhere. The copper traces act like tiny wires that connect components together so electricity flows through the correct path in a complete circuit. You may consider the components as buildings, the traces as roads, and electric current as cars traveling between them. The point is, it is a clean, compact, and reliable way for electrical components to work.</p>
              <img src="/pcb-tutorial/What_is_High_Speed_PCB_Design_-97613.jpg" alt="PCB Example" className="my-6 rounded-lg" />
              {/* Types of PCB */}
              <h3 className="text-[34px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Types of PCB</h3>
              <ul className="mb-4 list-disc pl-6">
                <li>Single-layer PCB: one layer of copper traces and simplest to make</li>
                <li>Double-layer PCB: traces on top and bottom, can fit more connections</li>
                <li>Multi-layer PCB: many layers, used in computers, phones, and complex electronics</li>
              </ul>
              {/* Materials to Build Your PCB */}
              <h3 className="text-[34px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Materials to Build Your PCB</h3>
              <b>Design phase:</b>
              <ul className="mb-4 list-disc pl-6">
                <li>PCB Design software (e.g. KiCad, EasyEDA)</li>
              </ul>
              <b>Build phase:</b>
              <ul className="mb-4 list-disc pl-6">
                <li>PCB Manufacturer (e.g. PCBWAY, JLCPCB, etc.)</li>
                <li>Components (e.g. resistors, LEDs, microcontrollers, etc.)</li>
                <li>Soldering tools</li>
              </ul>
              <p className="mb-4">Here, I’ve only covered instructions on the design phase. I will hopefully soon make a more detailed tutorial on the build phase as well.</p>
              {/* Instructions */}
              <h2 className="text-[44px] font-bold mt-8 mb-4 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Instructions</h2>
              <h3 className="text-[34px] font-semibold mb-2 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Step One: Installing the Software</h3>
              <p className="mb-4">To design your PCB, you’ll need to install KiCad, a free and open-source PCB design tool. KiCad works on Windows, macOS, and Linux, and it provides everything you need to create schematics, lay out your board, and generate files for manufacturing. To install, <a href="https://www.kicad.org/download/" target="_blank" className="underline text-blue-600">download</a> the latest version from the official KiCad website, follow the installation prompts, and open the program. Once installed, you’ll be ready to start designing your first PCB project!</p>
              <p className="mb-4">P.S. There is no functional difference across the locations mentioned. For North America, you could get either the GitHub or MIT one.</p>
              <img src="/pcb-tutorial/image.png" alt="KiCad Screenshot" className="my-6 rounded-lg" />
              {/* Step Two: Creating Schematic */}
              <h3 className="text-[34px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Step Two: Creating Schematic</h3>
              <h4 className="text-[24px] font-semibold mb-2 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Placing Components</h4>
              <p className="mb-4">The next step is to create a schematic, which is a digital diagram of your circuit. Open KiCad, and create a new project from file. Here, we will be placing components like resistors, LEDs, and the 555 timer using the built-in component library.</p>
              <p className="mb-4">In this tutorial, we are creating a heart-shaped PCB. For a schematic, the shape doesn’t really matter yet. It’s a logical design.</p>
              <p className="mb-4">The components we’ll be using are:</p>
              <ul className="mb-4 list-disc pl-6">
                <li>x16+ Red LEDs</li>
                <li>x1 555 Timer IC</li>
                <li>x1 10 μF Capacitor</li>
                <li>x1 100k Variable Resistor</li>
                <li>x1 10k Resistor</li>
                <li>x1 330 ohm resistor</li>
                <li>x1 1 Push Button</li>
                <li>x1 9V Battery Holder Clip</li>
              </ul>
              <img src="/pcb-tutorial/image%201.png" alt="Component List" className="my-6 rounded-lg" />
              {/* Images and component instructions omitted for brevity, but can be added as <img> tags referencing public assets if needed */}
              <p className="mb-4">Now open the schematic editor and use the “Add Symbol” tool to search for and insert components from the built-in library.</p>
              <p className="mb-4">We’re going to use a 555 timer IC to make the LEDs blink on and off repeatedly. In the search bar of place components, look for ICM7555xB.</p>
              <p className="mb-4">Now we’re going to add the resistors. The 330 ohm resistor is placed between the timer output and the LEDs to control how much current flows. The 10k ohm resistor, together with the capacitor and variable resistor, controls how fast the LEDs blink. The 100k variable resistor (or you could say potentiometer) lets you adjust the blinking speed of the LEDs or LED brightness.</p>
              <p className="mb-4">Now look up resistors in the place component search bar and add 2 resistors and 1 variable resistor.</p>
              <img src="/pcb-tutorial/b46dd394-39d5-426a-8245-58c4acc5bbad.png" alt="Resistor" className="my-6 rounded-lg" />
              <img src="/pcb-tutorial/image%202.png" alt="Variable Resistor" className="my-6 rounded-lg" />
              <p className="mb-4">P.S: After you add the components, you can rotate their position with the shortcut R key.</p>
              <p className="mb-4">Afterwards, we’re going to add the 10 µF capacitor, which works with the resistor to create the timing cycle. The capacitor charges and discharges repeatedly, which makes the 555 timer output switch on and off, creating the blinking effect.</p>
              <img src="/pcb-tutorial/image%203.png" alt="Capacitor" className="my-6 rounded-lg" />
              <p className="mb-4">Now we are going to add the push button switch (SW), which is used to turn on the lights when you press it. In your heart PCB, the pushbutton acts as a momentary switch that connects the battery to the circuit only while it's pressed by closing the circuit. To add the momentary switch, look for the SW Push Button.</p>
              <img src="/pcb-tutorial/f7983228-009f-44fc-9e8f-b1712f5c99e3.png" alt="Push Button" className="my-6 rounded-lg" />
              <p className="mb-4">Now we need to add the battery. To do so, look up BT and add it to your schematic diagram.</p>
              <img src="/pcb-tutorial/image%204.png" alt="Battery" className="my-6 rounded-lg" />
              <p className="mb-4">Next, add the ground (GND) connection to the schematic. It represents the reference point of the circuit and provides a path for electrical current to return to the battery. It should be connected to the GND of the 555 timer IC and the cathode (negative side) of the battery.</p>
              <img src="/pcb-tutorial/image%205.png" alt="Ground" className="my-6 rounded-lg" />
              <p className="mb-4">You should also place a PWR_FLAG symbol on the power line coming from the battery. The power flag isn’t a real component in the physical circuit; instead, it tells KiCad that the wire is intentionally supplying power. This prevents showing electrical rule check warnings and makes the design properly powered.</p>
              <img src="/pcb-tutorial/image%206.png" alt="Power Flag" className="my-6 rounded-lg" />
              <p className="mb-4">You will also need LEDs, as many as you want to be on your PCB board. For this heart PCB, I’ll be adding 16 of them. In the same process, look up for LED and GND to add in the cathode (negative part). In an LED symbol, the end with the straight line is the cathode.</p>
              <img src="/pcb-tutorial/image%207.png" alt="LED" className="my-6 rounded-lg" />
              <img src="/pcb-tutorial/image%208.png" alt="LED Ground" className="my-6 rounded-lg" />
              <p className="mb-4">Now, we’re going to add labels from the timer’s pin 3. It is the output pin that switches on and off to create the blinking effect. Without a label, we need to wire the anode from all LEDs to this pin 3. However, with a label, we can wire two pins without adding physical wire between them. As long as both pins have the same name, KiCan knows that they’re connected.</p>
              <p className="mb-4">Click "Global Labels” in the right sidebar (shortcut key Ctrl + L) and create the label TOUT (timer output). Now add this label to pin 3 of your timer 555 as well as to all the anodes (positive sides) of each LED.</p>
              <img src="/pcb-tutorial/image%209.png" alt="Global Label TOUT" className="my-6 rounded-lg" />
              <p className="mb-4">This is how the LED schematic should look like.</p>
              <img src="/pcb-tutorial/image%2010.png" alt="LED Schematic" className="my-6 rounded-lg" />
              <h4 className="text-[24px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Assign Footprints</h4>
              <p className="mb-4">The footprints are the physical shapes of the parts that will go on your PCB. Each component in your schematic needs a footprint so that KiCad knows how to place it and where to solder it on the board.</p>
              <p className="mb-4">On the top menu bar of the schematic page, go to Tools and then to Assign Footprints. A window will open showing all your components on the left and the footprint library on the right. In the search bar above, you can search for the name of the footprints and add it to the components.</p>
              <img src="/pcb-tutorial/image%2011.png" alt="Assign Footprints" className="my-6 rounded-lg" />
              <img src="/pcb-tutorial/image%2012.png" alt="Footprint Library" className="my-6 rounded-lg" />
              <p className="mb-4">After you add these footprints, click “Apply, Save Schematic & Continue” button.</p>
              <h4 className="text-[24px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Wiring the diagram</h4>
              <p className="mb-4">Now that all components are placed, it’s time to wire them together. Wiring the diagram is basically connecting all parts of your circuit where electricity flows. Drawing wires in the schematic shows how each part should connect, which helps the PCB software know where to place traces later and ensure that your circuit will actually function!</p>
              <p className="mb-4">To draw wires, you can select the draw wire option on the right sidebar, or else choose shortcut key W and double-click to end drawing.</p>
              <img src="/pcb-tutorial/image%2013.png" alt="Draw Wire" className="my-6 rounded-lg" />
              <h4 className="text-md font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Powering the Circuit</h4>
              <ul className="mb-4 list-disc pl-6">
                <li>Connect the battery positive (+) to the push button input</li>
                <li>Connect the push button output to Pin 8 (VCC) of the 555 timer and Pin 4 (Reset)</li>
              </ul>
              <h4 className="text-md font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Timing Circuit</h4>
              <ul className="mb-4 list-disc pl-6">
                <li>Connect Pin 7 (Discharge) to 10k resistor to pin 2 (Trigger) and 6 (Threshold)</li>
                <li>Connect Pin 7 also to the 100k variable resistor and VCC (pin 8)</li>
                <li>Connect the 10µF capacitor between Pin 2/6 (positive) and GND (negative)</li>
              </ul>
              <h4 className="text-md font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Output to LEDs</h4>
              <ul className="mb-4 list-disc pl-6">
                <li>Connect Pin 3 (output) to 330 ohm resistor</li>
              </ul>
              <h4 className="text-md font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Final Checks</h4>
              <ul className="mb-4 list-disc pl-6">
                <li>Place PWR_FLAG on the wire connecting Pin 4 and VCC</li>
                <li>Run Inspect and then Electrical Rules Check (ERC) to catch any unconnected pins or mistakes</li>
              </ul>
              <p className="mb-8">You are now done with the schematic of your first PCB project!!!</p>
              <div className="my-12" />
              <h3 className="text-[34px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Step Three: PCB Layout</h3>
              <h4 className="text-[24px] font-semibold mb-2 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Exporting to PCB Editor</h4>
              <img src="/pcb-tutorial/4cfe1cc1-98d2-4baa-bf72-f2314a050dce.png" alt="PCB Editor" className="my-6 rounded-lg" />
              <p className="mb-4">As you are done with schematic, you need to open your schematic in the PCB editor. In the top menu bar, click on "switch to PCB editor.” It will open a new tab in the PCB editor with all the components in the schematic file.</p>
              <h4 className="text-[24px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Drawing the Shape</h4>
              <img src="/pcb-tutorial/image%2014.png" alt="Heart Shape" className="my-6 rounded-lg" />
              <p className="mb-4">Now we’ll be drawing the shape for how we want the PCB to be manufactured. It’s very common to go for a rectangular shape board, but as we’re working on making a heart PCB we will draw the heart now.</p>
              <p className="mb-4">First, you should make sure that you are on the Edge.Cuts layer. Anything you draw on this layer becomes the physical boundary of your PCB. So now with the drawing tool on the right side bar (using line, arc, shapes) we draw the heart shape. Make sure to connect all the points and so that it is a closed loop. Later, you will place all of your components inside this outline.</p>
              <p className="mb-4">Now arrange all your components inside the outline you just drew. For this heart PCB, I’ll be putting all the LEDs all around the corner and the 555 timer, resistors, capacitor, push button in the middle. You are free to choose where to place what components on your PCB board. However, make sure you don’t cram all of components in one spot because you need enough room to draw the copper traces (wires) between pins.</p>
              <img src="/pcb-tutorial/image%2015.png" alt="Component Placement" className="my-6 rounded-lg" />
              <p className="mb-4">Now that all your components are placed, it’s time to connect them with copper traces. This process is called routing! It is like drawing the roads that electricity will follow to flow between your components.</p>
              <img src="/pcb-tutorial/image%2016.png" alt="Routing PCB" className="my-6 rounded-lg" />
              <p className="mb-4">Now you should be on F.Cu (front copper) layer. I’m using the copper width of 0.25 mm. You can choose the width from a drop down bar in the top menu.</p>
              <p className="mb-4">Select the route single track button on the right side and connect the pins by following the blue lines. Click on the pin from where you want to start and then click again on the pin where you want to connect to. This way, you will have a copper trace along this path. Now as you keep on completing these traces, there will be some paths that you can’t cross over and connect because a copper trace can’t overlap on another trace. In this case, after you’re done with all possible connections on the front layer, go to the B.Cu (back copper) layer and connect the rest of the tracing in the back side. It’s best that you try to make the traces short and direct, without unnecessary bends for the sake of looking pretty!</p>
              <p className="mb-4">After you are done tracing to route the PCB, you should always run the Design Rule Check (DRC). It will show any errors you have on the tracing, in terms of having extra tracing not connected to anywhere and such. Fix any errors the DRC finds before exporting your PCB for manufacturing.</p>
              <h3 className="text-[34px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Step Four: Export the PCB Board</h3>
              <h4 className="text-[24px] font-semibold mb-2 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>View the 3D PCB Board</h4>
              <img src="/pcb-tutorial/image%2017.png" alt="3D PCB View" className="my-6 rounded-lg" />
              <img src="/pcb-tutorial/image%2018.png" alt="3D PCB View 2" className="my-6 rounded-lg" />
              <p className="mb-4">Now is the fun part of taking a look at your PCB board in the 3D viewer. In the top menu, there’s an option for 3D view. You should inspect your PCB from all angles and make sure it looks like the way you want it to be manufactured.</p>
              <h4 className="text-[24px] font-semibold mb-2 mt-6 text-left" style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}>Download Your PCB for Manufacturing</h4>
              <p className="mb-4">If you are planning to manufacture your PCB board, you need to export it as files a manufacturer can use. These are called Gerber Files.</p>
              <p className="mb-4">To download Gerber, go to file and then plot. Make sure all the necessary layers are selected. Then plot the gerber file and you’re ready to send this to a manufacturer.</p>
              <p className="mb-4">And that's all! You've just designed your first PCB. From schematic to layout to Gerber files, you now know the full design workflow. If you run into any issues, please feel free to slack me at <b>@afia ava</b>. Happy making!</p>
              <div style={{ height: '80px' }} />
            </article>
        </div>
      </main>
    </div>
  );
}
