export default async function ratingBoardScenario(a, b) {
  await a.getByRole("button", { name: "Rate 5 stars" }).click();
  await b.getByRole("button", { name: "Rate 3 stars" }).click();
  await b.getByText("2 responses").first().waitFor({ timeout: 10_000 });
  await b.getByText("4.0").waitFor({ timeout: 10_000 });
  await a.waitForTimeout(1_200);
}
