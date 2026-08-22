export default async function ratingBoardScenario(a, b) {
  await a.getByRole("button", { name: "Rate 5 stars" }).click();
  await b.getByRole("button", { name: "Rate 3 stars" }).click();
  await b.getByText(/from 2 peers/).waitFor({ timeout: 10_000 });
  await a.waitForTimeout(1_200);
}
