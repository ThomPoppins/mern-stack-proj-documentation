import { useRouter } from "next/router";
import { title } from "process";

export default {
  NextSeoProps() {
    const { asPath } = useRouter();
    console.log('asPath', asPath)
    let titleTempleValue = "";
    if (asPath !== "/") {
      titleTemplateValue: "%s – SWR";
    }

    return {
      titleTemplate: titleTempleValue,
      title: "MERN_STACK_PROJ.",
      description:
        "MERN_STACK_PROJ. is a full stack MERN application developed by Thom Veldpaus",
    };
  },
};
