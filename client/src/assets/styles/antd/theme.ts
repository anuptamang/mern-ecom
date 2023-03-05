import { ThemeConfig } from "antd"

const colors = {
  blue: '#32a0d9',
  purple: '#8d0fda',
  white: '#fff',
  black: '#333',
  dark: '#001529'
}


export const theme: ThemeConfig = {

  token: {
    colorPrimary: colors.blue,
    colorPrimaryBg: colors.purple,

    colorLink: colors.purple,
    colorText: colors.black,
    fontSize: 16,
    fontFamily: "Mulish, sans-serif"
  },

  components: {
    Button: {
      colorPrimary: colors.purple,
    },
  },
}
