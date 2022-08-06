In order to get products and subscriptions.

1. Go to developer.apple.com
2. Open "Certificates, Identifiers & Profiles" > "Identifiers"
3. Click the "Plus" button
4. Select "App IDs", continue, select "App"
5. Complete the form
   Description: React Native IAP Example
   Bundle ID (explicit): org.reactjs.native.example.IapExample
6. Click "Register"

7. Go to AppStore Connect and login into your personal account
8. Create a new app
   Platforms: iOS
   Name: React Native IAP Example <SOME_STRING>
   Sku: reactnativeiapexample
9. Go to "In-App Purchases", click "Create"
10. Select "Consumable"
    Reference Name: com.cooni.point1000
    Product ID: com.cooni.point1000 (can be the value defined in utils/constants.ts)
    And create
11. Go back to the app, login with your account when AppStore shows you the prompt
12. Voila it should be showing the data
