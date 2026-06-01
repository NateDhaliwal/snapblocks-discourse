import { withPluginApi } from "discourse/lib/plugin-api";
import {
  addBlockDecorateCallback,
  addTagDecorateCallback,
} from "discourse/lib/to-markdown";
import snapblocks from "../../lib/snapblocks/snapblocks-es.js";
import loadTranslations from "../../lib/snapblocks/translations-all-es.js";

function applySnapblocks(element, settings) {
  async function renderElement(el) {
    let style = el.getAttribute("blockStyle") || settings.block_style;
    snapblocks.renderElement(el, {
      style: settings.block_style,
      zebra: settings.zebra_coloring,
      wrap: settings.block_wrap,
      showSpaces: settings.show_spaces,
      santa: settings.santa_hats,
      scale: style.startsWith("scratch3")
        ? settings.block_scale * 0.675
        : settings.block_scale,
      elementOptions: true,
      languages: Object.keys(snapblocks.allLanguages),
    });
  }

  element.querySelectorAll(".snapblocks-blocks").forEach((sb) => {
    renderElement(sb);
    if (sb.getAttribute("snapblocks-source")) {
      sb.setAttribute(
        "snapblocks-source",
        sb.getAttribute("snapblocks-source").replaceAll("\n", "&NewLine;")
      );
    }
  });
}

function initializeSnapblocks(api, settings) {
  api.decorateCookedElement((el) => applySnapblocks(el, settings), {
    id: "snapblocks-discourse",
  });

  api.addComposerToolbarPopupMenuOption({
    action: function (toolbarEvent) {
      toolbarEvent.applySurround(
        "\n" + `[snapblocks]` + "\n",
        "\n[/snapblocks]\n",
        "snapblocks_text",
        { multiline: false }
      );
    },
    icon: "code",
    label: "snapblocks_discourse.title",
  });

  addTagDecorateCallback(function () {
    const { attributes } = this.element;

    if (attributes["snapblocks-source"]) {
      let prefix = "[sb";

      const attrs = [
        "blockstyle",
        "wrap",
        "wrapsize",
        "zebra",
        "showspaces",
        "santa",
      ];
      for (const attr of attrs) {
        if (attributes[attr]) {
          prefix += ` ${attr}=${attributes[attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/sb]";
      return attributes["snapblocks-source"].replaceAll("&NewLine;", "\n");
    }
  });
  addBlockDecorateCallback(function () {
    const { attributes } = this.element;

    if (attributes["snapblocks-source"]) {
      let prefix = "[snapblocks";

      const attrs = [
        "blockstyle",
        "wrap",
        "wrapsize",
        "zebra",
        "showspaces",
        "santa",
      ];
      for (const attr of attrs) {
        if (attributes[attr]) {
          prefix += ` ${attr}=${attributes[attr]}`;
        }
      }

      prefix += "]";

      this.prefix = prefix;
      this.suffix = "[/snapblocks]";
      return `\n${attributes["snapblocks-source"].replaceAll(
        "&NewLine;",
        "\n"
      )}\n`;
    }
  });
}

export default {
  name: "apply-snapblocks",
  initialize(container) {
    // console.debug(`snapblocks version: ${snapblocks.version}`);

    loadTranslations(snapblocks);
    withPluginApi("1.15.0", (api) => {
      return initializeSnapblocks(api, settings);
    });
  },
};
