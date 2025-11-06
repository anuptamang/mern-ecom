# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e7]:
          - button "previous" [disabled] [ref=e8]:
            - img "previous" [ref=e9]
          - button "next" [disabled] [ref=e11]:
            - img "next" [ref=e12]
          - generic [ref=e14]: 1 of 1 error
        - button "Close" [ref=e15] [cursor=pointer]:
          - img [ref=e17]
      - heading "Unhandled Runtime Error" [level=1] [ref=e20]
      - paragraph [ref=e21]: "TypeError: Cannot read properties of undefined (reading 'productsSlice')"
    - generic [ref=e22]:
      - heading "Source" [level=2] [ref=e23]
      - generic [ref=e24]:
        - link "src/redux/store.ts (10:15) @ productsSlice" [ref=e26] [cursor=pointer]:
          - generic [ref=e27]: src/redux/store.ts (10:15) @ productsSlice
          - img [ref=e28]
        - generic [ref=e32]: "8 | const store = configureStore({ 9 | reducer: { > 10 | products: productsSlice.reducer, | ^ 11 | productsFilter: productsFilterSlice.reducer, 12 | auth: authSlice.reducer, 13 | carts: cartsSlice.reducer,"
      - heading "Call Stack" [level=2] [ref=e33]
      - button "Show collapsed frames" [ref=e34] [cursor=pointer]
```