// MongoDB 아이디는 24글자이고, 0~9 숫자와 a~f 영문으로만 이루어져 있어요. 예: "6abcc60882bb11f8e36d8321"
const ID_LETTERS = "0123456789abcdef";

// 주소로 들어온 아이디가 이 모양이 맞는지 확인합니다.
// 모양이 틀린 아이디로 DB에 물어보면 오류가 나기 때문에, 먼저 걸러내요.
export function isValidId(id: string): boolean {
  if (id.length !== 24) {
    return false;
  }
  for (const letter of id.toLowerCase()) {
    if (!ID_LETTERS.includes(letter)) {
      return false;
    }
  }
  return true;
}
