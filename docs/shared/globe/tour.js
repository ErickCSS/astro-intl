import { gsap } from "gsap";
import { geoDistance, geoInterpolate } from "d3-geo";
import {
  countries,
  countryClass,
  globeProjection,
  grid,
  pathGenerator,
  stops,
} from "./geography.mjs";

class LanguageGlobe extends HTMLElement {
  connectedCallback() {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const language = Number(this.dataset.language);
    const buttons = [...this.querySelectorAll("[data-stop]")];
    const paths = [...this.querySelectorAll("[data-country]")];
    const mesh = this.querySelector("[data-grid]");
    const pin = this.querySelector("[data-pin]");
    const playback = this.querySelector("[data-playback]");
    let index = 0;
    let center = stops[0].point;
    let visible = false;
    let paused = false;
    let timer;
    let flight;
    const projection = globeProjection(center);
    const path = pathGenerator(projection);

    const draw = () => {
      projection.rotate([-center[0], -center[1]]);
      mesh.setAttribute("d", path(grid));
      paths.forEach((node, i) =>
        node.setAttribute("d", path(countries[i]) ?? ""),
      );
      const destination = stops[index].point;
      pin.setAttribute(
        "visibility",
        geoDistance(center, destination) < Math.PI / 2 ? "visible" : "hidden",
      );
      pin.setAttribute(
        "transform",
        "translate(" + projection(destination).join(" ") + ")",
      );
    };
    const select = (next) => {
      flight?.kill();
      index = next;
      const stop = stops[index];
      this.querySelector("[data-name]").textContent = stop.name[language];
      this.querySelector("[data-tag]").textContent = stop.code;
      this.querySelector("[data-city]").textContent = stop.city[language];
      const greeting = this.querySelector("[data-greeting]");
      greeting.lang = stop.code;
      greeting.textContent = stop.greeting;
      buttons.forEach((button, i) =>
        button.setAttribute("aria-pressed", String(i === next)),
      );
      paths.forEach((node, i) => {
        node.classList.remove("selected", "spoken", "land");
        node.classList.add(countryClass(countries[i], stop));
      });
      if (reduce.matches) {
        center = stop.point;
        draw();
        return;
      }
      const route = geoInterpolate(center, stop.point);
      const progress = { t: 0 };
      flight = gsap.to(progress, {
        t: 1,
        duration: 0.95,
        ease: "power2.inOut",
        onUpdate() {
          center = route(progress.t);
          draw();
        },
      });
    };
    const schedule = () => {
      clearTimeout(timer);
      if (visible && !paused && !reduce.matches && !document.hidden) {
        timer = setTimeout(() => {
          select((index + 1) % stops.length);
          schedule();
        }, 6000);
      }
      playback.firstElementChild.textContent = paused ? "▶" : "Ⅱ";
      playback.setAttribute(
        "aria-label",
        (paused
          ? ["Reproducir recorrido", "Play tour"]
          : ["Pausar recorrido", "Pause tour"])[language],
      );
    };
    const pause = () => {
      paused = true;
      schedule();
    };
    buttons.forEach((button, i) =>
      button.addEventListener(
        "click",
        () => {
          pause();
          select(i);
        },
        options,
      ),
    );
    this.addEventListener(
      "focusin",
      (event) => {
        if (event.target.matches(":focus-visible")) pause();
      },
      options,
    );
    playback.addEventListener(
      "click",
      () => {
        paused = !paused;
        schedule();
      },
      options,
    );
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        schedule();
      },
      { threshold: 0.15 },
    );
    observer.observe(this);
    document.addEventListener("visibilitychange", schedule, options);
    reduce.addEventListener(
      "change",
      () => {
        if (reduce.matches) {
          pause();
          select(index);
        }
        schedule();
      },
      options,
    );
    this.cleanup = () => {
      clearTimeout(timer);
      flight?.kill();
      controller.abort();
      observer.disconnect();
    };
  }
  disconnectedCallback() {
    this.cleanup?.();
  }
}
if (!customElements.get("language-globe"))
  customElements.define("language-globe", LanguageGlobe);
