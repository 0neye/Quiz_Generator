// import { ParseOutput, Tool } from "./types"

// /**
//   * Parses the output string and returns an array of ParseOutput objects.
//   * @param {string} output - The output string from the model.
//   * @param {string[] | null} answerPrefixes - An array of prefixes to match model answers.
//   * @param {string[] | null} toolPrefixes - An array of prefixes to match tool inputs.
//   * @param {Tool[] | null} tools - An array of tool objects.
//   * @returns {ParseOutput[]} - An array of ParseOutput objects.
//   * @throws {Error} - Throws an error if the output argument is null.
//   */
// export function parseModelOutput(output: string, answerPrefixes: string[] | null, toolPrefixes: string[] | null, tools: Tool[] | null): ParseOutput[] {
//     if (output === null) {
//         throw new Error("output argument to 'parseModelOutput' is null")
//     }
//     let result: ParseOutput[] = []
//     // look for any answers
//     if (answerPrefixes) {
//         answerPrefixes.forEach((prefix) => {
//             const answerExpr = new RegExp(prefix + "(.*)");
//             const answer = output.match(answerExpr)?.[0]
//             if (answer) {
//                 const cleanedAnswer = answer.replace(prefix, "").trim();
//                 result.push({ type: "ModelAnswer", value: cleanedAnswer })
//             }
//             else {
//                 return [{ type: "OutputError", value: "I couldn't parse your answer. Please try again." }]
//             }
//         })
//     }
//     // next handle tool use
//     if (toolPrefixes) {
//         toolPrefixes.forEach((prefix) => {
//             const toolExpr = new RegExp(prefix + "(.*)");
//             // first get the tool inputs
//             const toolInput = output.match(toolExpr)?.[0]
//             if (toolInput) {
//                 // go through tool failure patterns
//                 let toolFailed = false
//                 tools?.forEach((tool) => {
//                     tool.failure_patterns.forEach((pattern) => {
//                         if (pattern.expression.test(toolInput)) {
//                             result.push({ type: "OutputError", value: pattern.message })
//                             toolFailed = true
//                         }
//                     })
//                 })
//                 if (!toolFailed) {
//                     const cleanedToolInput = toolInput.replace(prefix, "").trim();
//                     result.push({ type: "ModelToolUse", value: cleanedToolInput })
//                 }
//             }
//             else {
//                 return [{ type: "OutputError", value: `I couldn't parse your tool input. Please try again.` }]
//             }
//         })
//     }
//     if (result.length === 0) {
//         return [{ type: "OutputError", value: "I didn't see you pick a tool or return an answer. Please try again." }]
//     }
//     return result
// }