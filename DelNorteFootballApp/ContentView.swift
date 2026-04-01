import SwiftUI
import PassKit

struct ContentView: View {
    @StateObject private var passManager = PassManager()

    var body: some View {
        ZStack {
            Color(red: 0/255, green: 45/255, blue: 98/255)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    // Card Preview
                    cardPreview
                        .padding(.top, 40)

                    // Add to Wallet Button
                    addToWalletButton

                    // Status messages
                    if passManager.isLoading {
                        ProgressView()
                            .tint(.white)
                    }

                    if let error = passManager.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    if passManager.showSuccess {
                        Text("Pass added to Wallet!")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.green)
                    }

                    // Instructions
                    Text("Card must be presented for discount.\nNot good with any other offer.")
                        .font(.caption)
                        .foregroundColor(Color(red: 197/255, green: 165/255, blue: 90/255))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    // Participating businesses
                    businessList
                        .padding(.bottom, 40)
                }
            }
        }
    }

    // MARK: - Card Preview

    private var cardPreview: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 212/255, green: 185/255, blue: 106/255),
                            Color(red: 197/255, green: 165/255, blue: 90/255),
                            Color(red: 184/255, green: 152/255, blue: 64/255)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 320, height: 200)
                .shadow(color: .black.opacity(0.4), radius: 12, y: 6)

            VStack(spacing: 4) {
                Text("DEL NORTE")
                    .font(.system(size: 18, weight: .heavy))
                    .tracking(3)
                    .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))

                Text("NIGHTHAWK")
                    .font(.system(size: 26, weight: .black))
                    .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))

                Text("DISCOUNT CARD")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))

                // Logo placeholder circle
                ZStack {
                    Circle()
                        .fill(.white)
                        .frame(width: 70, height: 70)
                        .overlay(
                            Circle()
                                .stroke(Color(red: 0/255, green: 45/255, blue: 98/255), lineWidth: 2)
                        )

                    Text("DN")
                        .font(.system(size: 24, weight: .black))
                        .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))
                }
                .padding(.top, 4)
            }

            // $20 label
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("$20")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))
                }
            }
            .frame(width: 290, height: 175)

            // Valid thru
            VStack {
                HStack {
                    Spacer()
                    Text("VALID THRU\n7/31/2027")
                        .font(.system(size: 9, weight: .semibold))
                        .multilineTextAlignment(.trailing)
                        .foregroundColor(Color(red: 0/255, green: 45/255, blue: 98/255))
                }
                Spacer()
            }
            .frame(width: 290, height: 175)
        }
    }

    // MARK: - Add to Wallet

    private var addToWalletButton: some View {
        Button(action: {
            passManager.addPassToWallet()
        }) {
            HStack(spacing: 8) {
                Image(systemName: "wallet.pass")
                    .font(.title3)
                Text("Add to Apple Wallet")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .padding(.horizontal, 28)
            .padding(.vertical, 14)
            .background(Color.black)
            .cornerRadius(12)
        }
        .disabled(passManager.isLoading)
    }

    // MARK: - Business List

    private var businessList: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("PARTICIPATING BUSINESSES")
                .font(.caption)
                .fontWeight(.semibold)
                .tracking(1)
                .foregroundColor(Color(red: 197/255, green: 165/255, blue: 90/255))
                .padding(.bottom, 12)

            ForEach(businesses, id: \.name) { biz in
                HStack {
                    Text(biz.name)
                        .fontWeight(.semibold)
                        .foregroundColor(Color(red: 197/255, green: 165/255, blue: 90/255))
                    Spacer()
                    Text(biz.discount)
                        .foregroundColor(.gray)
                }
                .font(.caption)
                .padding(.vertical, 6)

                if biz.name != businesses.last?.name {
                    Divider()
                        .background(Color.white.opacity(0.1))
                }
            }
        }
        .padding(20)
        .background(Color.white.opacity(0.08))
        .cornerRadius(12)
        .padding(.horizontal, 20)
    }

    private var businesses: [(name: String, discount: String)] {
        [
            ("Baskin Robbins", "BOGO 50% off scoops"),
            ("Harland Brewing", "10% off"),
            ("Board & Brew", "10% off"),
            ("L&L Hawaiian Barbecue", "10% off"),
            ("Kahoots", "20% off treats & bones"),
            ("Mostra Coffee", "10% off"),
            ("Rosinas", "10% off"),
            ("Donut Touch", "10% off"),
            ("Sushi Ken", "20% off"),
            ("Flippin Pizza", "$5 off over $15"),
            ("Round Table Pizza", "10% off (RB)"),
        ]
    }
}

#Preview {
    ContentView()
}
