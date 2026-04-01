import Foundation
import PassKit
import UIKit

class PassManager: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showSuccess = false

    /// Base URL of the Node.js pass server.
    /// Change this to your deployed server URL in production.
    var serverURL = "http://localhost:3000"

    func addPassToWallet() {
        isLoading = true
        errorMessage = nil

        guard let url = URL(string: "\(serverURL)/pass") else {
            errorMessage = "Invalid server URL"
            isLoading = false
            return
        }

        let task = URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false

                if let error = error {
                    self?.errorMessage = "Network error: \(error.localizedDescription)"
                    return
                }

                guard let data = data, !data.isEmpty else {
                    self?.errorMessage = "No pass data received from server"
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                    self?.errorMessage = "Server returned an error"
                    return
                }

                do {
                    let pass = try PKPass(data: data)
                    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                          let rootVC = scene.windows.first?.rootViewController else {
                        self?.errorMessage = "Cannot present pass dialog"
                        return
                    }

                    let addPassVC = PKAddPassesViewController(pass: pass)
                    // Find the topmost presented view controller
                    var topVC = rootVC
                    while let presented = topVC.presentedViewController {
                        topVC = presented
                    }
                    topVC.present(addPassVC!, animated: true) {
                        self?.showSuccess = true
                    }
                } catch {
                    self?.errorMessage = "Invalid pass data: \(error.localizedDescription)"
                }
            }
        }
        task.resume()
    }
}
