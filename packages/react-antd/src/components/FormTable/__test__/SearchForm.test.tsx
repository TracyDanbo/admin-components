import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  InputTypes,
  SearchForm,
  SearchFromProps,
} from "@/components/FormTable";

const props: SearchFromProps = {
  fields: [
    {
      name: "id",
      label: "订单编号",
      type: InputTypes.INPUT,
    },
    {
      name: "time",
      label: "开始时间",
      type: InputTypes.DATERANGE,
    },
  ],
};

describe("render SearchForm", () => {
  test("render  with fields props", () => {
    const { container, getByText } = render(<SearchForm {...props} />);
    expect(getByText("订单编号")).toBeInTheDocument();
  });
  test("renader with children props", () => {
    const { container, getByText } = render(
      <SearchForm {...props}>
        <div data-testid="children">children</div>
      </SearchForm>
    );
    const pickerRange = container.querySelectorAll(".ant-picker-range");
    expect(pickerRange).toHaveLength(1);
    // expect(screen.getByTestId("children")).toBe('"children"');
    // expect(screen.getByTestId("children")).toBeEmptyDOMElement();
  });
});
